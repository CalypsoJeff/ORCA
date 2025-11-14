import Address from "../models/addressModel.js";

export const addAddress = async (req, res) => {
  try {
    const { name, phone, addressLine1, addressLine2, city, state, pincode } = req.body;
    const userId = req.user._id; 
    const address = new Address({
      user: userId,
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
    });
    await address.save();
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    const addresses = await Address.find({ user: userId }).sort({ createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findByIdAndUpdate(id, req.body, { new: true });
    res.json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.id);
    res.json({ message: "Address deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    await Address.updateMany({ user: userId }, { isDefault: false });
    const updated = await Address.findByIdAndUpdate(id, { isDefault: true }, { new: true });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
