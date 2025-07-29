const loadAddressPage = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate("address");
    res.render("user/address", { user });
  } catch (error) {
    console.error("Error loading address page:", error);
    res.status(500).send("Internal Server Error");
  }
}
const addAddress = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { name, phone, address, city, state, country, pincode } = req.body;

    const newAddress = new Address({
      name,
      phone,
      address,
      city,
      state,
      country,
      pincode
    });

    await newAddress.save();

    await User.findByIdAndUpdate(userId, {
      $push: { address: newAddress._id }
    });

    res.redirect("/user/addresses");
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).send("Internal Server Error");
  }
}
const deleteAddress = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const addressId = req.body.addressId;

    await User.findByIdAndUpdate(userId, {
      $pull: { address: addressId }
    });

    await Address.findByIdAndDelete(addressId);

    res.redirect("/user/addresses");
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).send("Internal Server Error");
  }
}
const editAddress = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const addressId = req.body.addressId;
    const { name, phone, address, city, state, country, pincode } = req.body;

    await Address.findByIdAndUpdate(addressId, {
      name,
      phone,
      address,
      city,
      state,
      country,
      pincode
    });

    res.redirect("/user/addresses");
  } catch (error) {
    console.error("Error editing address:", error);
    res.status(500).send("Internal Server Error");
  }
}


export default {
  loadAddressPage,
  addAddress,
  deleteAddress,
  editAddress
}