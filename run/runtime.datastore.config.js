const { env } = require("process");

function getCommandLineArgsAsJSON() {
  // grab cmdline args
  let cl = process.argv;
  let cmdLineArgs = undefined;
  // import args in to "cl" JSON style object
  if(cl && cl.forEach){
    cmdLineArgs = {};
    cl.forEach( (val, ind, arr) => {
      let retVal = val;
      let retKey = val;
      if(val && val.indexOf && val.indexOf('=')){
        retKey = (val.split('='))[0];
        retVal = (val.split('='))[1];
      }
      cmdLineArgs[ retKey ] = retVal;
    })
  }
  return cmdLineArgs;
}

function createCorsConfigFromInput( dirToWriteTo ) {
  // return value
  let retConfig = undefined;

  // grab env vars
  let env = process.env;
  if(env.SENZING_WEB_SERVER_CORS_ALLOWED_ORIGIN){
    retConfig = {
      "origin": env.SENZING_WEB_SERVER_CORS_ALLOWED_ORIGIN,
      "optionsSuccessStatus": 200,
      "optionsFailureStatus": 401
    };
  }

  // grab cmdline args
  //let cl = process.argv;
  let corsOpts = getCommandLineArgsAsJSON();

  /*if(cl && cl.forEach){
    corsOpts = {};
    cl.forEach( (val, ind, arr) => {
      let retVal = val;
      let retKey = val;
      if(val && val.indexOf && val.indexOf('=')){
        retKey = (val.split('='))[0];
        retVal = (val.split('='))[1];
      }
      corsOpts[ retKey ] = retVal;
    })
  }*/

  if(corsOpts && corsOpts.corsAllowedOrigin) {
    retConfig = {
      "origin": corsOpts.corsAllowedOrigin,
      "optionsSuccessStatus": corsOpts.corsSuccessResponseCode ? corsOpts.corsSuccessResponseCode : 200,
      "optionsFailureStatus": corsOpts.corsFailureResponseCode ? corsOpts.corsFailureResponseCode : 401
    };
  }

  /*
  if(corsOpts && corsOpts.corsAllowedOrigin) {
    // compile new auth conf
    let corsTmpl = fs.readFileSync(corsTemplate, 'utf8');
    let corsTmplAction = compile(corsTmpl);

    fs.writeFile(__dirname + path.sep + 'cors.conf.json', corsTmplAction(corsOpts), function(err){
      if(!err) {
          //file written on disk
          console.log('wrote cors.conf.output.json \n',corsOpts);
      } else {
          console.log('could not write cors.conf.json', err);
      }
    });
  } else {
    // shrug, allow everything?
    // delete the cors.conf.json file
    try {
      if(fs.existsSync(__dirname + path.sep + 'cors.conf.json')) {
        fs.unlink(__dirname + path.sep + 'cors.conf.json', function(err) {
          if(!err) {
            // successfully removed file
          } else {
            console.log('could not remove cors.conf.json',err);
          }
        });
      }
    } catch(err){
      console.log('no cors conf to remove..');
    }
  }
  */
  return retConfig;
}

/** get command line and env vars as options for the AuthModule */
function getOptionsFromInput() {
  // grab env vars
  let env = process.env;
  let authOpts = getCommandLineArgsAsJSON();
  /*
  if(cl && cl.forEach){
    authOpts = {};
    cl.forEach( (val, ind, arr) => {
      let retVal = val;
      let retKey = val;
      if(val && val.indexOf && val.indexOf('=')){
        retKey = (val.split('='))[0];
        retVal = (val.split('='))[1];
      }
      authOpts[ retKey ] = retVal;
    })
  }*/
  if(env.SENZING_WEB_SERVER_ADMIN_AUTH_MODE) {
    authOpts = authOpts && authOpts !== undefined ? authOpts : {
      adminAuthMode: env.SENZING_WEB_SERVER_ADMIN_SECRET
    }
  }
  if(env.SENZING_WEB_SERVER_ADMIN_SECRET) {
    authOpts = authOpts && authOpts !== undefined ? authOpts : {
      adminSecret: env.SENZING_WEB_SERVER_ADMIN_SECRET
    }
  }
  if(env.SENZING_WEB_SERVER_ADMIN_SEED) {
    authOpts = authOpts && authOpts !== undefined ? authOpts : {
      adminToken: env.SENZING_WEB_SERVER_ADMIN_SEED
    }
  }
  return authOpts;
}

function createCspConfigFromInput() {
  let retConfig = undefined;

  retConfig = {
    directives: {
      'default-src': [`'self'`],
      'connect-src': [`'self'`],
      'script-src':  [`'self'`, `'unsafe-eval'`],
      'style-src':   [`'self'`, `'unsafe-inline'`, 'https://fonts.googleapis.com'],
      'font-src':    [`'self'`, `https://fonts.gstatic.com`, `https://fonts.googleapis.com`]
    },
    reportOnly: false
  };

  return retConfig;
}

/** get auth conf template */
function createAuthConfigFromInput() {
  // return value
  let retConfig = undefined;

  // -------------------- start ENV vars import ------------------
    // grab env vars
    let env = process.env;
    if(env.SENZING_WEB_SERVER_ADMIN_AUTH_MODE) {
      retConfig = retConfig !== undefined ? retConfig : {};
      retConfig.admin = {};
      if(SENZING_WEB_SERVER_ADMIN_AUTH_MODE === 'JWT'){
        retConfig.admin = {
          "mode": "JWT",
          "checkUrl": env.SENZING_WEB_SERVER_ADMIN_AUTH_STATUS ? env.SENZING_WEB_SERVER_ADMIN_AUTH_STATUS : "/admin/auth/jwt/status",
          "redirectOnFailure": true,
          "loginUrl": env.SENZING_WEB_SERVER_ADMIN_AUTH_REDIRECT ? env.SENZING_WEB_SERVER_ADMIN_AUTH_REDIRECT : "/admin/login"
        }
      } else if(env.SENZING_WEB_SERVER_ADMIN_AUTH_MODE === 'SSO') {
        retConfig.admin = {
          "mode": "SSO",
          "checkUrl": env.SENZING_WEB_SERVER_ADMIN_AUTH_STATUS ? env.SENZING_WEB_SERVER_ADMIN_AUTH_STATUS : "/admin/auth/sso/status",
          "redirectOnFailure": true,
          "loginUrl": env.SENZING_WEB_SERVER_ADMIN_AUTH_REDIRECT ? env.SENZING_WEB_SERVER_ADMIN_AUTH_REDIRECT : "/admin/login"
        }
      }
    }
    if(env.SENZING_WEB_SERVER_OPERATOR_AUTH_MODE) {
      retConfig = retConfig !== undefined ? retConfig : {};
      retConfig.operator = {};
      if(SENZING_WEB_SERVER_OPERATOR_AUTH_MODE === 'JWT'){
        retConfig.operator = {
          "mode": "JWT",
          "checkUrl": env.SENZING_WEB_SERVER_OPERATOR_AUTH_STATUS ? env.SENZING_WEB_SERVER_OPERATOR_AUTH_STATUS : "/auth/jwt/status",
          "redirectOnFailure": true,
          "loginUrl": env.SENZING_WEB_SERVER_OPERATOR_AUTH_REDIRECT ? env.SENZING_WEB_SERVER_OPERATOR_AUTH_REDIRECT : "/login"
        }
      } else if(env.SENZING_WEB_SERVER_OPERATOR_AUTH_MODE === 'SSO') {
        retConfig.operator = {
          "mode": "SSO",
          "checkUrl": env.SENZING_WEB_SERVER_OPERATOR_AUTH_STATUS ? env.SENZING_WEB_SERVER_OPERATOR_AUTH_STATUS : "/auth/sso/status",
          "redirectOnFailure": true,
          "loginUrl": env.SENZING_WEB_SERVER_OPERATOR_AUTH_REDIRECT ? env.SENZING_WEB_SERVER_OPERATOR_AUTH_REDIRECT : "/login"
        }
      }
  }
  if(env.SENZING_WEB_SERVER_PORT) {
    retConfig = retConfig !== undefined ? retConfig : {};
    retConfig.port = SENZING_WEB_SERVER_PORT;
  }
  if(env.SENZING_WEB_SERVER_HOSTNAME) {
    retConfig = retConfig !== undefined ? retConfig : {};
    retConfig.hostname = SENZING_WEB_SERVER_HOSTNAME;
  }
  // -------------------- end ENV vars import ------------------
  // -------------------- start CMD LINE ARGS import -----------
    // grab cmdline args
    let cl = process.argv;
    let authOpts = getCommandLineArgsAsJSON();
    /*
    // import args in to "cl" JSON style object
    if(cl && cl.forEach){
      authOpts = {};
      cl.forEach( (val, ind, arr) => {
        let retVal = val;
        let retKey = val;
        if(val && val.indexOf && val.indexOf('=')){
          retKey = (val.split('='))[0];
          retVal = (val.split('='))[1];
        }
        authOpts[ retKey ] = retVal;
      })
    }*/
    // now check our imported cmdline args
    if(authOpts && authOpts !== undefined && authOpts.adminAuthMode && authOpts.adminAuthMode !== undefined) {
      retConfig = retConfig !== undefined ? retConfig : {};
      retConfig.admin = retConfig && retConfig.admin ? retConfig.admin : {};
      if(authOpts.adminAuthMode === 'JWT') {
        retConfig.admin = {
          "mode": "JWT",
          "checkUrl": authOpts.adminAuthStatusUrl ? authOpts.adminAuthStatusUrl : "/admin/auth/jwt/status",
          "redirectOnFailure": true,
          "loginUrl": authOpts.adminAuthRedirectUrl ? authOpts.adminAuthRedirectUrl : "/admin/login"
        }
      } else if (authOpts.adminAuthMode === 'SSO') {
        retConfig.admin = {
          "mode": "SSO",
          "checkUrl": authOpts.adminAuthStatusUrl ? authOpts.adminAuthStatusUrl : "/admin/auth/sso/status",
          "redirectOnFailure": authOpts.adminAuthRedirectOnFailure ? authOpts.adminAuthRedirectOnFailure : true,
          "loginUrl": authOpts.adminAuthRedirectUrl ? authOpts.adminAuthRedirectUrl : "/admin/login"
        }
      }
    }
    if(authOpts && authOpts !== undefined && authOpts.operatorAuthMode && authOpts.operatorAuthMode !== undefined) {
      retConfig = retConfig !== undefined ? retConfig : {};
      retConfig.operator = retConfig && retConfig.operator ? retConfig.operator : {};
      if(authOpts.operatorAuthMode === 'JWT') {
        retConfig.operator = {
          "mode": "JWT",
          "checkUrl": authOpts.operatorAuthStatusUrl ? authOpts.operatorAuthStatusUrl : "/auth/jwt/status",
          "redirectOnFailure": true,
          "loginUrl": authOpts.operatorAuthRedirectUrl ? authOpts.operatorAuthRedirectUrl : "/login"
        }
      } else if (authOpts.adminAuthMode === 'SSO') {
        retConfig.operator = {
          "mode": "SSO",
          "checkUrl": authOpts.operatorAuthStatusUrl ? authOpts.operatorAuthStatusUrl : "/auth/sso/status",
          "redirectOnFailure": true,
          "loginUrl": authOpts.operatorAuthRedirectUrl ? authOpts.operatorAuthRedirectUrl : "/login"
        }
      }
    }
    if(authOpts && authOpts !== undefined && authOpts.authServerPortNumber && authOpts.authServerPortNumber !== undefined) {
      retConfig.port = authOpts.authServerPortNumber;
    }
    if(authOpts && authOpts !== undefined && authOpts.authServerHostName && authOpts.authServerHostName !== undefined) {
      retConfig.hostname = authOpts.authServerHostName;
    }

  // -------------------- end CMD LINE ARGS import -----------

  //console.log('AUTH TEMPLATE: ', authTemplate, fs.existsSync(authTemplate));
  //console.log('AUTH OPTS: ', JSON.stringify(authOpts, null, 2));
  //console.log('ENV VARS: ', JSON.stringify(process.env.SENZING_WEB_AUTH_SERVER_ADMIN_MODE, null, 2));
  //console.log('Write to Directory: ', __dirname);

  return retConfig;
}

function getProxyServerOptionsFromInput() {
  let retOpts = {
    authServerHostName: "localhost",
    authServerPortNumber: 8080,
    logLevel: "error",
    apiServerUrl: "",
    adminAuthPath: "http://localhost:8080",
    jwtPathRewrite: "/jwt",
    ssoPathRewrite: "/sso",
    adminJwtPathRewrite: "/jwt/admin",
    adminSsoPathRewrite: "/sso/admin",
    writeToFile: false,
  };

  let cmdLineOpts = getCommandLineArgsAsJSON();
  if(cmdLineOpts && cmdLineOpts !== undefined) {
    if(cmdLineOpts.authServerPortNumber) {
      retOpts.authServerPortNumber  = cmdLineOpts.authServerPortNumber;
      retOpts.adminAuthPath         = "http://localhost:"+ retOpts.authServerPortNumber;
    }
    if(cmdLineOpts.proxyLogLevel) {
      retOpts.logLevel = cmdLineOpts.proxyLogLevel;
    }
    if(cmdLineOpts.adminAuthPath) {
      retOpts.adminAuthPath = cmdLineOpts.adminAuthPath;
    }
    if(cmdLineOpts.apiServerUrl && cmdLineOpts.apiServerUrl !== undefined) {
      retOpts.apiServerUrl = cmdLineOpts.apiServerUrl;
    }
    if(cmdLineOpts.proxyJWTPathRewrite) {
      retOpts.jwtPathRewrite = cmdLineOpts.proxyJWTPathRewrite;
    }
    if(cmdLineOpts.proxySSOPathRewrite) {
      retOpts.ssoPathRewrite = cmdLineOpts.proxySSOPathRewrite;
    }
    if(cmdLineOpts.proxyAdminJWTPathRewrite) {
      retOpts.adminJwtPathRewrite = cmdLineOpts.proxyAdminJWTPathRewrite;
    }
    if(cmdLineOpts.proxyAdminSSOPathRewrite) {
      retOpts.adminSsoPathRewrite = cmdLineOpts.proxyAdminSSOPathRewrite;
    }
    if(cmdLineOpts.writeProxyConfigToFile === 'true' || cmdLineOpts.writeProxyConfigToFile === 'TRUE') {
      retOpts.writeToFile = true;
    }
  }
  return retOpts;
}

function createProxyConfigFromInput() {
  let retConfig = undefined;
  let proxyOpts = getProxyServerOptionsFromInput();

  if(env.SENZING_API_SERVER_URL) {
    retConfig = retConfig !== undefined ? retConfig : {};
    retConfig["/api/*"] = {
      "target": env.SENZING_API_SERVER_URL,
      "secure": true,
      "logLevel": proxyOpts.logLevel,
      "pathRewrite": {
        "^/api": ""
      }
    }
  }

  if(env.SENZING_WEB_SERVER_ADMIN_AUTH_PATH) {
    retConfig = retConfig !== undefined ? retConfig : {};
    let mergeObj = {
      "/admin/auth/jwt/*": {
        "target": env.SENZING_WEB_SERVER_ADMIN_AUTH_PATH,
        "secure": true,
        "logLevel": proxyOpts.logLevel,
        "pathRewrite": {
          "^/admin/auth/jwt": proxyOpts.adminJwtPathRewrite
        }
      },
      "/admin/auth/sso/*": {
        "target": env.SENZING_WEB_SERVER_ADMIN_AUTH_PATH,
        "secure": true,
        "logLevel": proxyOpts.logLevel,
        "pathRewrite": {
          "^/admin/auth/sso": proxyOpts.adminSsoPathRewrite
        }
      },
      "/auth/jwt/*": {
        "target": env.SENZING_WEB_SERVER_ADMIN_AUTH_PATH + "/jwt/",
        "secure": true,
        "logLevel": proxyOpts.logLevel,
        "pathRewrite": {
          "^/auth/jwt": proxyOpts.jwtPathRewrite
        }
      },
      "/auth/sso/*": {
        "target": env.SENZING_WEB_SERVER_ADMIN_AUTH_PATH + "/sso/",
        "secure": true,
        "logLevel": proxyOpts.logLevel,
        "pathRewrite": {
          "^/auth/sso": proxyOpts.ssoPathRewrite
        }
      },
      "/config/auth": {
        "target": env.SENZING_WEB_SERVER_ADMIN_AUTH_PATH + "/conf/auth/",
        "secure": true,
        "logLevel": proxyOpts.logLevel,
        "pathRewrite": {
          "^/config/auth": ""
        }
      },
      "/cors/test": {
        "target": env.SENZING_WEB_SERVER_ADMIN_AUTH_PATH + "/cors/test/",
        "secure": true,
        "logLevel": proxyOpts.logLevel,
        "withCredentials": true,
        "pathRewrite": {
          "^/cors/test": ""
        }
      }
    }
    retConfig = Object.assign(retConfig, mergeObj);
  }
  // -------------------- start CMD LINE ARGS import -----------
    // now check our imported cmdline args
    if(proxyOpts.apiServerUrl && proxyOpts.apiServerUrl !== undefined) {
      retConfig = retConfig !== undefined ? retConfig : {};
      retConfig["/api/*"] = {
        "target": proxyOpts.apiServerUrl,
        "secure": true,
        "logLevel": proxyOpts.logLevel,
        "pathRewrite": {
          "^/api": ""
        }
      }
    }
    if(proxyOpts.adminAuthPath && proxyOpts.adminAuthPath !== undefined) {
      retConfig = retConfig !== undefined ? retConfig : {};
      let mergeObj = {
        "/admin/auth/jwt/*": {
          "target": proxyOpts.adminAuthPath,
          "secure": true,
          "logLevel": proxyOpts.logLevel,
          "pathRewrite": {
            "^/admin/auth/jwt": proxyOpts.adminJwtPathRewrite
          }
        },
        "/admin/auth/sso/*": {
          "target": proxyOpts.adminAuthPath,
          "secure": true,
          "logLevel": proxyOpts.logLevel,
          "pathRewrite": {
            "^/admin/auth/sso": proxyOpts.adminSsoPathRewrite
          }
        },
        "/auth/jwt/*": {
          "target": proxyOpts.adminAuthPath + "/jwt/",
          "secure": true,
          "logLevel": proxyOpts.logLevel,
          "pathRewrite": {
            "^/auth/jwt": proxyOpts.jwtPathRewrite
          }
        },
        "/auth/sso/*": {
          "target": proxyOpts.adminAuthPath + "/sso/",
          "secure": true,
          "logLevel": proxyOpts.logLevel,
          "pathRewrite": {
            "^/auth/sso": proxyOpts.ssoPathRewrite
          }
        },
        "/config/auth": {
          "target": proxyOpts.adminAuthPath + "/conf/auth/",
          "secure": true,
          "logLevel": proxyOpts.logLevel,
          "pathRewrite": {
            "^/config/auth": ""
          }
        },
        "/cors/test": {
          "target": proxyOpts.adminAuthPath + "/cors/test/",
          "secure": true,
          "logLevel": proxyOpts.logLevel,
          "withCredentials": true,
          "pathRewrite": {
            "^/cors/test": ""
          }
        }
      }
      retConfig = Object.assign(retConfig, mergeObj);
    }
  // -------------------- end CMD LINE ARGS import -----------

  return retConfig;
}

module.exports = {
  "auth": createAuthConfigFromInput(),
  "cors": createCorsConfigFromInput(),
  "csp": createCspConfigFromInput(),
  "proxy": createProxyConfigFromInput(),
  "proxyServerOptions": getProxyServerOptionsFromInput()
}
