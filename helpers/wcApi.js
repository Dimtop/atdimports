
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default
const api = new WooCommerceRestApi({
    url: "https://highrollerswheels.com/",
    consumerKey: "ck_3331d4362be3d0ac79bd215cbd796883df02729b",
    consumerSecret: "cs_8b6da211df445b30d5dc3948d81eff21b63538ed",
    version: "wc/v3"
  });
const fs = require("fs")
const csv = require('csv-parser')
const atdData =require("../helpers/atdData")
const ATD_API = require("../helpers/atdApi")
const atdApi = new ATD_API(atdData)


function WC_API(){

  this.atdApi = new ATD_API(atdData);

  this.getAllProducts = async()=>{
    var products = [];
    var page = 1;
    var currentProductsCount = 100;

    while(currentProductsCount==100){
      console.log("--------------------")
      console.log("GETTING PRODUCTS OF PAGE " + page)
      var res = await api.get("products",{
          page:page,
          per_page:100
      })
      console.log("--Products found in current page: " + currentProductsCount)
      console.log("--Total current products: " + products.length)
    

      var currentProducts = res.data;
      currentProductsCount = currentProducts.length;
      for(var p of currentProducts){
        console.log("--Getting variations for product: " + p.id)
        var currVariations = await this.getVariationsFromProduct(p.id)
        for(var v of currVariations){
          var vAtdData = await this.atdApi.getProduct(v.sku);
          if(vAtdData.products&&vAtdData.products.length>0){
            v.regular_price = Number(vAtdData.products[0].price.retail);
            await this.updateVariation(v.id,p.id,v)
            console.log("----Updated variation " + v.sku + " price with " + v.regular_price)
          }else{
            console.log("----Variation " + v.sku + " is not an ATD product")
          }
       
        }
        p = {...p,variations:currVariations}
      }
  
      products.push(...currentProducts)
   
      page++;
    }
    return products;
  }


  this.getVariationsFromProduct = async(pid)=>{
    var variations = [];
    var page = 1;
    var currentVariationsCount = 100;

    while(currentVariationsCount==100){
      console.log("----Variations page: " + page)
      var res = await api.get("products/" + pid + "/variations",{
          page:page,
          per_page:100
      })
      var currentVariations = res.data;
      currentVariationsCount = currentVariations.length;
      variations.push(...currentVariations)
      console.log("----Variations found in current page: " + currentVariationsCount)
      console.log("----Total current variations: " + variations.length)
      page++;
    }
    return variations
  }

  this.updateVariation = async(vid,pid,data)=>{
    await api.put("products/" + pid + "/variations/" + vid,data)
    .catch((error) => {
      console.log(error.response.data);
    });
  }

  this.parseProducts = async(filePath)=>{
    var results = []
    fs.createReadStream(filePath)
      .pipe(csv({}))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        var i =0;
        results = results.slice(79104,results.length)
        //fs.appendFileSync("./data/res.csv","\n" + Object.keys(results[0]).join(","))
        for(var r of results){
          i++
          if(r["Type"]=="variation"){
        
            var res = await atdApi.getProduct(r["SKU"])
            if(!res){
              r["Published"] = "0";
              fs.appendFileSync("./data/errors.csv","\n" +r["SKU"])
            }
            else if(res.products.length>0){
             
              var currProduct = res.products[0]
              if(currProduct.discontinued){
                r["Published"] = "0";
                r["Regular price"] = currProduct.price.retail.toString()
      
                console.log(i.toString()  +". " + currProduct.atdproductnumber +" - " + currProduct.price.retail + " DRAFT ")
              }else{
                r["Regular price"] = currProduct.price.retail.toString()
      
                console.log(i.toString()  +". " + currProduct.atdproductnumber +" - " + currProduct.price.retail)
              }
    
            }else{
              r["Published"] = "0";
             // r["Regular price"] = currProduct.price.retail
    
            }
          
          }
 
          fs.appendFileSync("./data/res.csv","\n" + Object.values(r).map(e=>e.toString().indexOf(",")>=0?'"' + e + '"':e).join(","))
        }
        console.log("DONE")
        res.send("Done")
    });

 
  }
}
module.exports = WC_API;