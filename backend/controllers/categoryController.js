import Category from "../models/CategorySchema.js";

export const createCategory = async (req, res) => {
    try {
        const {name, user} = req.body;
        const existingCategory = await Category.findOne({name, user});
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists",
            });
        }
        const category = new Category({name, user});
        await category.save();
        res.status(201).json({
            success: true,
            message: "Category created successfully",
        });
    } catch (error) {
        res.status(400).json({message: error.message});
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({user: req.query.user}).populate('user', 'name email');
        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).populate('user', 'name email');
        if (!category) {
            return res.status(404).json({message: "Category not found"});
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const updateCategory = async (req, res) => {
    try {
        const {name} = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {name},
            {new: true, runValidators: true}
        );
        if (!category) {
            return res.status(404).json({message: "Category not found"});
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
};


export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({message: "Category not found"});
        }
        res.status(200).json({message: "Category deleted successfully"});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};