import productsCategory from '../models/productCategory.js';

const addProductCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existingCategory = await productsCategory.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists.' });
        }
        const newCategory = new productsCategory({
            name,
            description,
        });
        const savedCategory = await newCategory.save();
        res.status(201).json({ message: 'Category added successfully', category: savedCategory });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ message: 'Failed to add category', error: error.message });
    }
};
const getAllProductCategories = async (req, res) => {
    try {
        const categories = await productsCategory.find();
        res.status(200).json({ message: 'Categories fetched successfully', categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
    }
};
const editProductCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, description } = req.body;
        const category = await productsCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        const existingCategory = await productsCategory.findOne({ name });
        if (existingCategory && existingCategory._id.toString() !== categoryId) {
            return res.status(400).json({ message: 'Category name already exists.' });
        }
        category.name = name || category.name;
        category.description = description || category.description;
        const updatedCategory = await category.save();
        res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
    } catch (error) {
        console.error('Error editing category:', error);
        res.status(500).json({ message: 'Failed to edit category', error: error.message });
    }
};
const toggleProductCategoryStatus = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await productsCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        category.status = category.status === 'active' ? 'inactive' : 'active';
        const updatedCategory = await category.save();
        res.status(200).json({ message: 'Category status updated successfully', category: updatedCategory });
    } catch (error) {
        console.error('Error toggling category status:', error);
        res.status(500).json({ message: 'Failed to update category status', error: error.message });
    }
};

export default {
    addProductCategory,
    getAllProductCategories,
    editProductCategory,
    toggleProductCategoryStatus
};