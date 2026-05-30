import Project from '../models/Project.js';
import ActivityLog from '../models/ActivityLog.js';
import { deleteImageFromCloudinary } from '../utils/cloudinary.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getProjects = async (req, res, next) => {
  const { category } = req.query;

  try {
    const query = {};
    if (category) {
      query.category = category;
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = async (req, res, next) => {
  const { title, description, category, clientName, completionDate, manualImages } = req.body;

  try {
    if (!title || !category) {
      return res.status(400).json({ message: 'Project title and category are required' });
    }

    let projectImages = [];
    let beforeImg = '';
    let afterImg = '';

    // Handle Multer upload
    if (req.files) {
      if (req.files.images) {
        projectImages = req.files.images.map(file => ({
          url: file.path,
          publicId: file.filename,
        }));
      }
      if (req.files.beforeImage) {
        beforeImg = {
          url: req.files.beforeImage[0].path,
          publicId: req.files.beforeImage[0].filename,
        };
      }
      if (req.files.afterImage) {
        afterImg = {
          url: req.files.afterImage[0].path,
          publicId: req.files.afterImage[0].filename,
        };
      }
    }

    // Manual images fallback
    if (projectImages.length === 0 && manualImages) {
      const imagesArray = Array.isArray(manualImages) ? manualImages : [manualImages];
      projectImages = imagesArray.map(img => ({
        url: img,
        publicId: img.includes('cloudinary') ? img.split('/').pop().split('.')[0] : 'legacy',
      }));
    }

    if (projectImages.length === 0 && (!beforeImg || !beforeImg.url)) {
      return res.status(400).json({ message: 'At least one project image is required' });
    }

    const project = await Project.create({
      title,
      description,
      category,
      images: projectImages,
      beforeImage: beforeImg,
      afterImage: afterImg,
      clientName,
      completionDate: completionDate ? new Date(completionDate) : null,
    });

    // Log Activity
    await ActivityLog.create({
      admin: req.user._id,
      action: `Created Project Portfolio Item: ${project.title}`,
      ipAddress: req.ip || '',
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
export const updateProject = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, category, clientName, completionDate, existingImages } = req.body;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (category) project.category = category;
    if (clientName !== undefined) project.clientName = clientName;
    if (completionDate !== undefined) {
      project.completionDate = completionDate ? new Date(completionDate) : null;
    }

    // Process images
    let projectImages = [];
    if (existingImages) {
      const existingArray = Array.isArray(existingImages) ? existingImages : [existingImages];
      projectImages = existingArray.map((img) => {
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
    const newPublicIds = projectImages.map(img => img.publicId).filter(Boolean);
    if (project.images && project.images.length > 0) {
      for (const oldImg of project.images) {
        if (oldImg.publicId && !newPublicIds.includes(oldImg.publicId)) {
          await deleteImageFromCloudinary(oldImg.publicId);
        }
      }
    }

    // Handle new uploads
    if (req.files) {
      if (req.files.images) {
        const newImages = req.files.images.map(file => ({
          url: file.path,
          publicId: file.filename,
        }));
        projectImages = [...projectImages, ...newImages];
      }
      if (req.files.beforeImage) {
        if (project.beforeImage && project.beforeImage.publicId) {
          await deleteImageFromCloudinary(project.beforeImage.publicId);
        }
        project.beforeImage = {
          url: req.files.beforeImage[0].path,
          publicId: req.files.beforeImage[0].filename,
        };
      }
      if (req.files.afterImage) {
        if (project.afterImage && project.afterImage.publicId) {
          await deleteImageFromCloudinary(project.afterImage.publicId);
        }
        project.afterImage = {
          url: req.files.afterImage[0].path,
          publicId: req.files.afterImage[0].filename,
        };
      }
    }

    if (projectImages.length > 0) {
      project.images = projectImages;
    }

    const updatedProject = await project.save();

    // Log Activity
    await ActivityLog.create({
      admin: req.user._id,
      action: `Updated Project Portfolio Item: ${updatedProject.title}`,
      ipAddress: req.ip || '',
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = async (req, res, next) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete images from Cloudinary
    if (project.images && project.images.length > 0) {
      for (const img of project.images) {
        if (img.publicId) {
          await deleteImageFromCloudinary(img.publicId);
        }
      }
    }
    if (project.beforeImage && project.beforeImage.publicId) {
      await deleteImageFromCloudinary(project.beforeImage.publicId);
    }
    if (project.afterImage && project.afterImage.publicId) {
      await deleteImageFromCloudinary(project.afterImage.publicId);
    }

    await Project.findByIdAndDelete(id);

    // Log Activity
    await ActivityLog.create({
      admin: req.user._id,
      action: `Deleted Project Portfolio Item: ${project.title}`,
      ipAddress: req.ip || '',
    });

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};
