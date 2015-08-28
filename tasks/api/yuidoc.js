module.exports = {
  
  // API doc
  api : {
    name : "<%= pkg.name %>",
    description : "<%= pkg.description %>",
    version : "<%= pkg.version %>",
    "options" : {
      paths : "lib",
      "outdir" : "./doc/openveo-api",
      "linkNatives" : true
    }
  }
  
};