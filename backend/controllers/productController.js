import Product from '../models/Product.js';
import Category from '../models/Category.js';
import ActivityLog from '../models/ActivityLog.js';
import { deleteImageFromCloudinary } from '../utils/cloudinary.js';

// Helper to generate slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Get all products (with search, filter, sort, and pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  const { search, category, sort, stockStatus, isFeatured, limit, page } = req.query;

  try {
    const query = {};

    // 1. Filter by Text Search
    if (search) {
      query.$text = { $search: search };
    }

    // 2. Filter by Category
    if (category) {
      // Find category first (could be ID or slug)
      const foundCategory = await Category.findOne({
        $or: [
          { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null },
          { slug: category },
        ].filter(Boolean),
      });

      if (foundCategory) {
        query.category = foundCategory._id;
      } else {
        // If category is provided but not found, return empty set quickly
        return res.status(200).json({ products: [], page: 1, pages: 0, total: 0 });
      }
    }

    // 3. Filter by Stock Status
    if (stockStatus) {
      query.stockStatus = stockStatus;
    }

    // 4. Filter by Featured
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    // 5. Build Sort Options
    let sortOptions = { createdAt: -1 }; // default sorting
    if (sort) {
      if (sort === 'price_asc') {
        sortOptions = { pricePerSqFt: 1 };
      } else if (sort === 'price_desc') {
        sortOptions = { pricePerSqFt: -1 };
      } else if (sort === 'popularity') {
        sortOptions = { popularity: -1 };
      } else if (sort === 'name_asc') {
        sortOptions = { name: 1 };
      } else if (sort === 'name_desc') {
        sortOptions = { name: -1 };
      }
    }

    // 6. Pagination Configurations
    const pageSize = Number(limit) || 12;
    const currentPage = Number(page) || 1;
    const count = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .limit(pageSize)
      .skip(pageSize * (currentPage - 1));

    res.status(200).json({
      products,
      page: currentPage,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug (and increment popularity)
// @route   GET /api/products/:slug
// @access  Public
export const getProductBySlug = async (req, res, next) => {
  const { slug } = req.params;

  try {
    const product = await Product.findOne({ slug }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment popularity ranking on view
    product.popularity += 1;
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  const {
    name,
    category,
    description,
    pricePerSqFt,
    colors,
    sizes,
    stockStatus,
    isFeatured,
    manualImages, // array of manual image paths from frontend (if pre-existing)
  } = req.body;

  try {
    if (!name || !category || !description || !pricePerSqFt) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const slug = slugify(name);
    const slugExists = await Product.findOne({ slug });

    if (slugExists) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }

    // Process files
    let productImages = [];
    if (req.files && req.files.length > 0) {
      productImages = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
    } else if (manualImages) {
      const imagesArray = Array.isArray(manualImages) ? manualImages : [manualImages];
      productImages = imagesArray.map((img) => ({
        url: img,
        publicId: img.includes('cloudinary') ? img.split('/').pop().split('.')[0] : 'legacy',
      }));
    }

    if (productImages.length === 0) {
      return res.status(400).json({ message: 'At least one product image is required' });
    }

    // Process strings to arrays
    const colorsArray = colors
      ? Array.isArray(colors)
        ? colors
        : colors.split(',').map((c) => c.trim())
      : [];
    const sizesArray = sizes
      ? Array.isArray(sizes)
        ? sizes
        : sizes.split(',').map((s) => s.trim())
      : [];

    const product = await Product.create({
      name,
      slug,
      category,
      description,
      pricePerSqFt: Number(pricePerSqFt),
      images: productImages,
      colors: colorsArray,
      sizes: sizesArray,
      stockStatus: stockStatus || 'In Stock',
      isFeatured: isFeatured === 'true' || isFeatured === true,
    });

    // Log Activity
    await ActivityLog.create({
      admin: req.user._id,
      action: `Created Product: ${product.name}`,
      ipAddress: req.ip || '',
    });

    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');
    res.status(201).json(populatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    category,
    description,
    pricePerSqFt,
    colors,
    sizes,
    stockStatus,
    isFeatured,
    existingImages, // Keep these images
  } = req.body;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name) {
      product.name = name;
      product.slug = slugify(name);
    }
    if (category) product.category = category;
    if (description) product.description = description;
    if (pricePerSqFt) product.pricePerSqFt = Number(pricePerSqFt);
    if (stockStatus) product.stockStatus = stockStatus;
    if (isFeatured !== undefined) {
      product.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    // Process Colors
    if (colors !== undefined) {
      product.colors = Array.isArray(colors)
        ? colors
        : colors.split(',').map((c) => c.trim()).filter(Boolean);
    }

    // Process Sizes
    if (sizes !== undefined) {
      product.sizes = Array.isArray(sizes)
        ? sizes
        : sizes.split(',').map((s) => s.trim()).filter(Boolean);
    }

    // Process images
    let productImages = [];
    if (existingImages) {
      const existingArray = Array.isArray(existingImages) ? existingImages : [existingImages];
      productImages = existingArray.map((img) => {
        if (typeof img === 'object' && img.url) return img;
        if (typeof img === 'string') {
          try {
            const parsed = JSON.parse(img);
            if (parsed.url) return parsed;
          } catch (e) {}
          return {
            url: img,
            publicId: img.includes('cloudinary') ? img.split('/').pop().split('.')[0] : 'legacy'
          };
        }
        return img;
      });
    }

    // Identify and delete removed images from Cloudinary
    const newPublicIds = productImages.map(img => img.publicId).filter(Boolean);
    if (product.images && product.images.length > 0) {
      for (const oldImg of product.images) {
        if (oldImg.publicId && !newPublicIds.includes(oldImg.publicId)) {
          await deleteImageFromCloudinary(oldImg.publicId);
        }
      }
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
      productImages = [...productImages, ...newImages];
    }

    if (productImages.length > 0) {
      product.images = productImages;
    }

    const updatedProduct = await product.save();

    // Log Activity
    await ActivityLog.create({
      admin: req.user._id,
      action: `Updated Product: ${updatedProduct.name}`,
      ipAddress: req.ip || '',
    });

    const populatedProduct = await Product.findById(updatedProduct._id).populate('category', 'name slug');
    res.status(200).json(populatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.publicId) {
          await deleteImageFromCloudinary(img.publicId);
        }
      }
    }

    await Product.findByIdAndDelete(id);

    // Log Activity
    await ActivityLog.create({
      admin: req.user._id,
      action: `Deleted Product: ${product.name}`,
      ipAddress: req.ip || '',
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
