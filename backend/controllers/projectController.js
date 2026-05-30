import Project from '../models/Project.js';
import ActivityLog from '../models/ActivityLog.js';

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
        projectImages = req.files.images.map(file => `/uploads/${file.filename}`);
      }
      if (req.files.beforeImage) {
        beforeImg = `/uploads/${req.files.beforeImage[0].filename}`;
      }
      if (req.files.afterImage) {
        afterImg = `/uploads/${req.files.afterImage[0].filename}`;
      }
    }

    // Manual images fallback
    if (projectImages.length === 0 && manualImages) {
      projectImages = Array.isArray(manualImages) ? manualImages : [manualImages];
    }

    if (projectImages.length === 0 && !beforeImg) {
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
      projectImages = Array.isArray(existingImages)
        ? existingImages
        : [existingImages];
    }

    // Handle new uploads
    if (req.files) {
      if (req.files.images) {
        const newImages = req.files.images.map(file => `/uploads/${file.filename}`);
        projectImages = [...projectImages, ...newImages];
      }
      if (req.files.beforeImage) {
        project.beforeImage = `/uploads/${req.files.beforeImage[0].filename}`;
      }
      if (req.files.afterImage) {
        project.afterImage = `/uploads/${req.files.afterImage[0].filename}`;
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
