#!/bin/env ksh

#base=''
#base=`pwd`/${base}
base=`dirname $0`
base=`(cd ${base}; pwd)`

uglify='yes'

# Global app. variables
bin=${base}/node_modules/.bin
app=${base}/app
fe_js=${app}/fe/js
src=${app}/src
src_js=${src}/js
index="index.js"

export PATH=${bin}:$PATH


########################################################
################### modules section ####################
########################################################
# 1. Create translate/index.js file 
translate=${app}/node_modules/translate
js_files="dictionary.js translate.js"

( cd ${translate};
  cat ${js_files} > ${index}
)

# 2. Create apis/index.js file
apis=${app}/node_modules/apis
js_files="globals.js helpers.js *.api.js"

( cd ${apis};
  cat ${js_files} > ${index}
)

########################################################
#################### uglify section ####################
########################################################

# Compress dictionary and copy it to frontend directory
translate=${app}/node_modules/translate
js_files="dictionary.js"
langs_list="./supportedLangsList"
out_file="${src_js}/dictionary.js"

( cd ${translate};
  cat ${js_files} > ${out_file}
  ${langs_list} >> ${out_file}
)

# Create globals.js file
config=${app}/node_modules/config
js_files="globals.js"
vars="./createVariables"
out_file="${src_js}/globals.js"

( cd ${config};
  cat ${js_files} > ${out_file}
  ${vars} >> ${out_file}
)

# Create controllers.js file
sources=${src}/controllers
js_files="HeadCtrl.js *.Ctrl.js"
out_file="${src_js}/controllers.js"

( cd ${sources};
  cat ${js_files} > ${out_file}
)

# Create services.js file
sources=${src}/services
js_files="HeadSrvs.js *.Srvs.js"
out_file="${src_js}/services.js"

( cd ${sources};
  cat ${js_files} > ${out_file}
)

# Create .min.js files
( export PATH=${bin}:$PATH
  cd ${src_js};
  for jf in `ls -1 | sed 's/\(.*\).js/\1/'`
  do
    if [ ${uglify} == 'yes' ]; then
      cat ${jf}.js | uglifyjs - --compress --mangle --output ${fe_js}/${jf}.min.js
    else
      cp ${jf}.js ${fe_js}/${jf}.min.js
    fi
  done
)

##  cat ${out_file} | uglifyjs - --compress --mangle --output ${min_file}
