const atdData =require("../helpers/atdData")
const WC_API = require("../helpers/wcApi")
const ATD_API = require("../helpers/atdApi")
const atdApi = new ATD_API(atdData)



exports.getProducts = async(req,res)=>{
    var brands = await atdApi.getAllBrands()
    var styles = await atdApi.getAllStyles(brands)
    var products = await atdApi.getProducts(styles)
    res.status(200).send({data:{products:products}})
}


exports.updatePrices = async(req,res)=>{
    var wcApi = new WC_API();
   // wcApi.parseProducts("./data/products1.csv")
   wcApi.getAllProducts()
}


