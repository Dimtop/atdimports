
const axios = require("axios")
const fs = require("fs")


function ATD_API(atdData){

    this.atdData = atdData


    this.getAllBrands = async ()=>{
        var res =  await axios({
            method:"post",
            url:this.atdData.mainURI+"/product/brands",
            data:{
                "locationnumber":"1525793"
            },
            headers:this.atdData.headers
        }).catch(err=>reject(err))

        return res.data;
    }

    this.getAllStyles = async(brands)=>{
        var styles = []
        brands.brandgroups = brands.brandgroups.slice(0,1)
        for(var bg of brands.brandgroups){
            var currCategory = this.getCategoryFromBrandsGroup(bg)
            if(currCategory=="Tires"||currCategory=="Wheels"){
                for(var b of bg.brands){
                    
                    var res=  await axios({
                        method:"post",
                        url:this.atdData.mainURI+"/product/styles",
                        data:{
                            "locationnumber":"1525793",
                            "brand":b.name
                        },
                        headers:this.atdData.headers
                    }).catch(err=>Promise.reject(err))
                    styles.push({...res.data,brandID:b.brandid,category:currCategory,brandName:b.name})
                }
            
            }
        }
        return styles;
    }

    this.getProducts=  async(styles)=>{
        var products=  []
        var i =0;
        var z = 0;
        for(var s of styles){

            for(var s1 of s.productgroups){
                for(var s2 of s1.styles){
                    i++;
                    fs.appendFileSync("./data/products.txt",'\n\n' + i.toString() +". " + s2.name + " - " + s.brandName + " - " + s.category)
                    var res=  await axios({
                        method:"post",
                        url:this.atdData.mainURI+"/product/product-by-criteria",
                        data:{
                            "locationnumber":"1525793",
                            "criteria":{
                                "styleid":[null],
                                "brandid":[s2.id]
                            },
                            "options":{
                                "availability":{
                                    "nationwide":1
                                },
                                "price":{
                                    "cost":1,
                                    "retail":1,
                                    "msrp":1,
                                    "map":1
                                },
                                "productspec":{},
                
                                "images":{
                                    "large":true,
                                    "small":true,
                                    "thumbnail":true
                                }
                            }
                        },
                        headers:this.atdData.headers
                    }).catch(err=>console.log("Error"))
                    var y = 0;
                    if(res){
                        if(res.data){
                            for(var p of res.data.products){
                                y++
                                z++
                                var currProduct = {
                                    ...p,
                                    brandID:s.brandID,
                                    styleID:s2.id,
                                    category:s.category
                                }
                                        
                                console.log(i.toString() +". " + currProduct.description)
                                fs.appendFileSync("./data/products.txt",'\n' + "    " +  i.toString() + "."+ y.toString() +" " + currProduct.description + " (" + z + ")")
                                products.push(currProduct)
                            }
                        }
                    }
                   
                }
            }
        }
        return products;
    }

    this.getProduct = async(atdProductNumber)=>{
        if(!atdProductNumber||atdProductNumber==""){
            return null
        }
        var res =  await axios({
            method:"post",
            url:this.atdData.mainURI+"/product/product-by-criteria",
            data:{
                "locationnumber":"1525793",
                "criteria":{
                    "atdproductnumber":[atdProductNumber]
                },
                "options":{
                    "availability":{
                        "nationwide":1
                    },
                    "price":{
                        "cost":1,
                        "retail":1,
                        "msrp":1,
                        "map":1
                    },
                    "productspec":{},
    
                    "images":{
                        "large":true,
                        "small":true,
                        "thumbnail":true
                    }
                }
            },
            headers:this.atdData.headers
        }).catch(err=>Promise.reject(err))


        return res.data;

       
    }


    this.getCategoryFromBrandsGroup = (bg)=>{
        var groupName=  bg.productgroup.toLowerCase()
        if(groupName.indexOf("tires")>=0){
            return "Tires"
        }
        if(groupName.indexOf("wheels")>=0){
            return "Wheels"
        }
        return "Other"
    }
}  




module.exports = ATD_API