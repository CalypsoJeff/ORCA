import Product from '../models/productModel.js';
import Category from "../models/productCategory.js"
import { uploadToCloudinary } from '../helper/uploadToCloudinary.js';
const loadProductsPage = async (req, res) => {
    try {
        const Products = await Product.find().sort({ createdAt: -1 }).populate("category", "name");
        if (!Products || Products.length === 0) {
            return res.status(200).json({
                message: "No products found.",
                Products: [],
            });
        }
        return res.status(200).json({
            message: "Products loaded successfully.",
            Products,
        });
    } catch (error) {
        console.error("Error loading products:", error);
        return res.status(500).json({
            message: "Failed to load products.",
            error: error.message,
        });
    }
};
const addProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discount,
            category,
            brand,
            sizes,
            material,
            rating,
        } = req.body;
        let parsedSizes;
        try {
            parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
        } catch (error) {
            return res.status(400).json({ message: "Invalid sizes format." });
        }
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({ message: "Invalid category reference." });
        }
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }
        const uploadedImages = await Promise.all(
            files.map(async (file) => {
                const { secure_url } = await uploadToCloudinary(file);
                console.log(secure_url,"details about cloud image")
                return secure_url;
            })
        );
        const product = new Product({
            name,
            description,
            price,
            discount: discount || 0,
            category,
            brand,
            sizes: parsedSizes,
            material,
            images: uploadedImages,
            rating: rating || 0,
        });
        await product.save();
        return res.status(200).json({
            message: "Product added successfully.",
            product,
        });
    } catch (error) {
        console.error("❌ Error adding product:", error);
        return res.status(500).json({
            message: "Failed to add product.",
            error: error.message,
        });
    }
};

const editProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            price,
            discount,
            category,
            brand,
            sizes,
            material,
            rating,
        } = req.body;
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({
                message: 'Product not found.',
            });
        }
        let parsedSizes;
        try {
            parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
        } catch (error) {
            return res.status(400).json({ message: "Invalid sizes format." });
        }
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({ message: 'Invalid category reference.' });
            }
        }
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }
        const uploadedImages = await Promise.all(
            files.map(async (file) => {
                const { secure_url } = await uploadToCloudinary(file);
                return secure_url;
            })
        );
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name: name || existingProduct.name,
                description: description || existingProduct.description,
                price: price || existingProduct.price,
                discount: discount || existingProduct.discount,
                category: category || existingProduct.category,
                brand: brand || existingProduct.brand,
                sizes: parsedSizes || existingProduct.sizes,
                material: material || existingProduct.material,
                images: uploadedImages || existingProduct.images,
                rating: rating || existingProduct.rating,
            },
            { new: true, runValidators: true }
        );
        return res.status(200).json({
            message: 'Product updated successfully.',
            product: updatedProduct,
        });
    } catch (error) {
        console.error('Error editing product:', error);
        return res.status(500).json({
            message: 'Failed to edit product.',
            error: error.message,
        });
    }
};

const changeProductStatus = async (req, res) => {
    try {
        const { productId } = req.params; // Extract product ID from URL parameters
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        const newStatus = product.status === 'active' ? 'inactive' : 'active';
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { status: newStatus },
            { new: true, runValidators: true }
        )
        res.status(200).json({
            message: `Product status changed to ${newStatus}`,
            product: updatedProduct,
        });

    } catch (error) {
        console.error('❌ Error changing product status:', error);
        res.status(500).json({ message: 'Failed to change product status', error: error.message });
    }
};


export default {
    addProduct,
    editProduct,
    changeProductStatus,
    loadProductsPage,
};