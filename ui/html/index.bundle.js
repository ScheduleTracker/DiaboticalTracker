/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/html/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/components/main_menu/aim_screen.css":
/*!*************************************************!*\
  !*** ./src/components/main_menu/aim_screen.css ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/aim_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/battlepass_list_screen.css":
/*!*************************************************************!*\
  !*** ./src/components/main_menu/battlepass_list_screen.css ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/battlepass_list_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/battlepass_screen.css":
/*!********************************************************!*\
  !*** ./src/components/main_menu/battlepass_screen.css ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/battlepass_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/battlepass_upgrade_screen.css":
/*!****************************************************************!*\
  !*** ./src/components/main_menu/battlepass_upgrade_screen.css ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/battlepass_upgrade_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/coin_shop_screen.css":
/*!*******************************************************!*\
  !*** ./src/components/main_menu/coin_shop_screen.css ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/coin_shop_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/create_screen.css":
/*!****************************************************!*\
  !*** ./src/components/main_menu/create_screen.css ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/create_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/customize_screen.css":
/*!*******************************************************!*\
  !*** ./src/components/main_menu/customize_screen.css ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/customize_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/friend_list.css":
/*!**************************************************!*\
  !*** ./src/components/main_menu/friend_list.css ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/friend_list.css?");

/***/ }),

/***/ "./src/components/main_menu/gift_screen.css":
/*!**************************************************!*\
  !*** ./src/components/main_menu/gift_screen.css ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/gift_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/home_screen.css":
/*!**************************************************!*\
  !*** ./src/components/main_menu/home_screen.css ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/home_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/ingame_menu.css":
/*!**************************************************!*\
  !*** ./src/components/main_menu/ingame_menu.css ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/ingame_menu.css?");

/***/ }),

/***/ "./src/components/main_menu/leaderboards_screen.css":
/*!**********************************************************!*\
  !*** ./src/components/main_menu/leaderboards_screen.css ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/leaderboards_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/learn_screen.css":
/*!***************************************************!*\
  !*** ./src/components/main_menu/learn_screen.css ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/learn_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/license_center_screen.css":
/*!************************************************************!*\
  !*** ./src/components/main_menu/license_center_screen.css ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/license_center_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/main_chat.css":
/*!************************************************!*\
  !*** ./src/components/main_menu/main_chat.css ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/main_chat.css?");

/***/ }),

/***/ "./src/components/main_menu/match_screen.css":
/*!***************************************************!*\
  !*** ./src/components/main_menu/match_screen.css ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/match_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/notification_screen.css":
/*!**********************************************************!*\
  !*** ./src/components/main_menu/notification_screen.css ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/notification_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/party_box.css":
/*!************************************************!*\
  !*** ./src/components/main_menu/party_box.css ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/party_box.css?");

/***/ }),

/***/ "./src/components/main_menu/play_screen.css":
/*!**************************************************!*\
  !*** ./src/components/main_menu/play_screen.css ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/play_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/play_screen_combined.css":
/*!***********************************************************!*\
  !*** ./src/components/main_menu/play_screen_combined.css ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/play_screen_combined.css?");

/***/ }),

/***/ "./src/components/main_menu/play_screen_custom.css":
/*!*********************************************************!*\
  !*** ./src/components/main_menu/play_screen_custom.css ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/play_screen_custom.css?");

/***/ }),

/***/ "./src/components/main_menu/play_screen_customlist.css":
/*!*************************************************************!*\
  !*** ./src/components/main_menu/play_screen_customlist.css ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/play_screen_customlist.css?");

/***/ }),

/***/ "./src/components/main_menu/player_profile_screen.css":
/*!************************************************************!*\
  !*** ./src/components/main_menu/player_profile_screen.css ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/player_profile_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/practice_screen.css":
/*!******************************************************!*\
  !*** ./src/components/main_menu/practice_screen.css ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/practice_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/settings_screen.css":
/*!******************************************************!*\
  !*** ./src/components/main_menu/settings_screen.css ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/settings_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/shop_item_screen.css":
/*!*******************************************************!*\
  !*** ./src/components/main_menu/shop_item_screen.css ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/shop_item_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/shop_screen.css":
/*!**************************************************!*\
  !*** ./src/components/main_menu/shop_screen.css ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/shop_screen.css?");

/***/ }),

/***/ "./src/components/main_menu/watch_screen.css":
/*!***************************************************!*\
  !*** ./src/components/main_menu/watch_screen.css ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/components/main_menu/watch_screen.css?");

/***/ }),

/***/ "./src/css/flexgrid.css":
/*!******************************!*\
  !*** ./src/css/flexgrid.css ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/css/flexgrid.css?");

/***/ }),

/***/ "./src/css/hp_color_table.css":
/*!************************************!*\
  !*** ./src/css/hp_color_table.css ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/css/hp_color_table.css?");

/***/ }),

/***/ "./src/css/ui.css":
/*!************************!*\
  !*** ./src/css/ui.css ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/css/ui.css?");

/***/ }),

/***/ "./src/css/ui_components.css":
/*!***********************************!*\
  !*** ./src/css/ui_components.css ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/css/ui_components.css?");

/***/ }),

/***/ "./src/css/ui_hud_editor.css":
/*!***********************************!*\
  !*** ./src/css/ui_hud_editor.css ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/css/ui_hud_editor.css?");

/***/ }),

/***/ "./src/css/ui_hud_elements.css":
/*!*************************************!*\
  !*** ./src/css/ui_hud_elements.css ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/css/ui_hud_elements.css?");

/***/ }),

/***/ "./src/css/ui_menu.css":
/*!*****************************!*\
  !*** ./src/css/ui_menu.css ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/css/ui_menu.css?");

/***/ }),

/***/ "./src/css/ui_postload.css":
/*!*********************************!*\
  !*** ./src/css/ui_postload.css ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/css/ui_postload.css?");

/***/ }),

/***/ "./src/esmodules/remote_resources.js":
/*!*******************************************!*\
  !*** ./src/esmodules/remote_resources.js ***!
  \*******************************************/
/*! exports provided: load_remote_map, upload_remote_map, create_remote_map, delete_remote_map, list_remote_maps, list_remote_maps_paginated, update_remote_map, list_player_remote_maps_paginated, init_remote_resources */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"load_remote_map\", function() { return load_remote_map; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"upload_remote_map\", function() { return upload_remote_map; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"create_remote_map\", function() { return create_remote_map; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"delete_remote_map\", function() { return delete_remote_map; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"list_remote_maps\", function() { return list_remote_maps; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"list_remote_maps_paginated\", function() { return list_remote_maps_paginated; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"update_remote_map\", function() { return update_remote_map; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"list_player_remote_maps_paginated\", function() { return list_player_remote_maps_paginated; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"init_remote_resources\", function() { return init_remote_resources; });\nconst global_download_remote_resources = {\n  downloaded: new Set(),\n  error: new Set(),\n  pending: new Set(),\n  pendingHandlers: {}\n};\nconst global_upload_remote_resources = {\n  uploaded: new Set(),\n  error: new Set(),\n  pending: new Set(),\n  pendingHandlers: {}\n};\n\nfunction download_remote_resource(key, size, timestamp, folder, handler) {\n  global_download_remote_resources.error.delete(key);\n  global_download_remote_resources.downloaded.delete(key);\n  global_download_remote_resources.pending.add(key);\n  global_download_remote_resources.pendingHandlers[key] = handler;\n  engine.call(\"download_remote_resource\", key, size, timestamp, folder);\n}\n\nfunction load_remote_map(map, onSuccess, onError) {\n  api_request(\"GET\", `/content/maps/${map}`, null, function (data) {\n    if (!data) {\n      engine.call(\"echo\", \"Cannot load map\");\n      return;\n    }\n\n    const pending_resources = new Set(data.files.map(e => e.key));\n    const map_file = data.files.map(e => e.key).find(file => file.match(/\\.rbe$/i));\n\n    if (data.files.length === 0) {\n      onSuccess && onSuccess(map_file);\n    } else {\n      data.files.forEach(entry => {\n        const timestamp = new Date(entry.last_modified).getTime();\n        download_remote_resource(entry.key, entry.size, timestamp, map, success => {\n          if (!success) {\n            onError && onError();\n            return;\n          }\n\n          pending_resources.delete(entry.key);\n\n          if (pending_resources.size === 0) {\n            onSuccess && onSuccess(map_file);\n          }\n        });\n      });\n    }\n  });\n}\n\nfunction upload_remote_resource(key, handler) {\n  global_upload_remote_resources.error.delete(key);\n  global_upload_remote_resources.uploaded.delete(key);\n  global_upload_remote_resources.pending.add(key);\n  global_upload_remote_resources.pendingHandlers[key] = handler;\n}\n\nfunction upload_remote_map(map, onSuccess, onError) {\n  const pending_resources = new Set([`${map}/${map}.rbe`, `${map}/${map}-h.png`, `${map}/${map}-b.png`]);\n  pending_resources.forEach(entry => {\n    upload_remote_resource(entry, success => {\n      if (!success) {\n        onError && onError(entry);\n        return;\n      }\n\n      pending_resources.delete(entry);\n\n      if (pending_resources.size === 0) {\n        onSuccess && onSuccess(map);\n      }\n    });\n  });\n  engine.call(\"publish_community_map\", map);\n}\nfunction create_remote_map(id, name, modes, onDone) {\n  console.log(modes);\n  api_request(\"POST\", \"/content/maps\", {\n    id,\n    name,\n    modes\n  }, onDone);\n}\nfunction delete_remote_map(id, onDone) {\n  api_request(\"POST\", `/content/delete/maps/${id}`, null, onDone);\n}\nfunction list_remote_maps(onDone) {\n  api_request(\"GET\", \"/content/maps\", null, onDone);\n}\nfunction list_remote_maps_paginated(page, onDone) {\n  api_request(\"GET\", `/content/maps?page=${page}`, null, onDone);\n}\nfunction update_remote_map(id, name, modes, onDone) {\n  api_request(\"POST\", `/content/update/maps/${id}`, {\n    name,\n    modes\n  }, onDone);\n}\nfunction list_player_remote_maps_paginated(page, onDone) {\n  api_request(\"GET\", `/content/maps?page=${page}&user_id=${global_self.user_id}`, null, onDone);\n}\nfunction init_remote_resources() {\n  /* Download event handlers */\n  bind_event(\"download_remote_resource_success\", function (key) {\n    global_download_remote_resources.error.delete(key);\n    global_download_remote_resources.pending.delete(key);\n    global_download_remote_resources.downloaded.add(key);\n    _id(\"fullscreen_spinner_message\").innerHTML = '';\n\n    if (key in global_download_remote_resources.pendingHandlers) {\n      global_download_remote_resources.pendingHandlers[key](true);\n      delete global_download_remote_resources.pendingHandlers[key];\n    }\n  });\n  bind_event(\"download_remote_resource_error\", function (key) {\n    global_download_remote_resources.pending.delete(key);\n    global_download_remote_resources.downloaded.delete(key);\n    global_download_remote_resources.error.add(key);\n    _id(\"fullscreen_spinner_message\").innerHTML = '';\n\n    if (key in global_download_remote_resources.pendingHandlers) {\n      global_download_remote_resources.pendingHandlers[key](false);\n      delete global_download_remote_resources.pendingHandlers[key];\n    }\n  });\n  bind_event(\"download_progress\", function (key, progress) {\n    _id(\"fullscreen_spinner_message\").innerHTML = `Downloading file ${key} ${Math.round(progress * 100)}%`;\n  });\n  /* Upload event handlers */\n\n  bind_event(\"upload_remote_resource_success\", function (key) {\n    console.log(\"upload_remote_resource_success: \" + key);\n    global_upload_remote_resources.error.delete(key);\n    global_upload_remote_resources.pending.delete(key);\n    global_upload_remote_resources.uploaded.add(key);\n    console.log(JSON.stringify(global_upload_remote_resources.pendingHandlers));\n\n    if (key in global_upload_remote_resources.pendingHandlers) {\n      global_upload_remote_resources.pendingHandlers[key](true);\n      delete global_upload_remote_resources.pendingHandlers[key];\n    }\n  });\n  bind_event(\"upload_remote_resource_error\", function (key) {\n    console.log(\"upload_remote_resource_error: \" + key);\n    global_upload_remote_resources.pending.delete(key);\n    global_upload_remote_resources.uploaded.delete(key);\n    global_upload_remote_resources.error.add(key);\n\n    if (key in global_upload_remote_resources.pendingHandlers) {\n      global_upload_remote_resources.pendingHandlers[key](false);\n      delete global_upload_remote_resources.pendingHandlers[key];\n    }\n  });\n}\n\n//# sourceURL=webpack:///./src/esmodules/remote_resources.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _css_flexgrid_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./css/flexgrid.css */ \"./src/css/flexgrid.css\");\n/* harmony import */ var _css_flexgrid_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_flexgrid_css__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _css_ui_menu_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./css/ui_menu.css */ \"./src/css/ui_menu.css\");\n/* harmony import */ var _css_ui_menu_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_css_ui_menu_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _css_ui_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./css/ui.css */ \"./src/css/ui.css\");\n/* harmony import */ var _css_ui_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_css_ui_css__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _css_ui_hud_editor_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./css/ui_hud_editor.css */ \"./src/css/ui_hud_editor.css\");\n/* harmony import */ var _css_ui_hud_editor_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_css_ui_hud_editor_css__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _css_ui_hud_elements_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./css/ui_hud_elements.css */ \"./src/css/ui_hud_elements.css\");\n/* harmony import */ var _css_ui_hud_elements_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_css_ui_hud_elements_css__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _css_hp_color_table_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./css/hp_color_table.css */ \"./src/css/hp_color_table.css\");\n/* harmony import */ var _css_hp_color_table_css__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_css_hp_color_table_css__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var _css_ui_components_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./css/ui_components.css */ \"./src/css/ui_components.css\");\n/* harmony import */ var _css_ui_components_css__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_css_ui_components_css__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var _components_main_menu_ingame_menu_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/main_menu/ingame_menu.css */ \"./src/components/main_menu/ingame_menu.css\");\n/* harmony import */ var _components_main_menu_ingame_menu_css__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_ingame_menu_css__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var _components_main_menu_friend_list_css__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/main_menu/friend_list.css */ \"./src/components/main_menu/friend_list.css\");\n/* harmony import */ var _components_main_menu_friend_list_css__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_friend_list_css__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var _components_main_menu_party_box_css__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/main_menu/party_box.css */ \"./src/components/main_menu/party_box.css\");\n/* harmony import */ var _components_main_menu_party_box_css__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_party_box_css__WEBPACK_IMPORTED_MODULE_9__);\n/* harmony import */ var _components_main_menu_main_chat_css__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./components/main_menu/main_chat.css */ \"./src/components/main_menu/main_chat.css\");\n/* harmony import */ var _components_main_menu_main_chat_css__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_main_chat_css__WEBPACK_IMPORTED_MODULE_10__);\n/* harmony import */ var _components_main_menu_home_screen_css__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./components/main_menu/home_screen.css */ \"./src/components/main_menu/home_screen.css\");\n/* harmony import */ var _components_main_menu_home_screen_css__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_home_screen_css__WEBPACK_IMPORTED_MODULE_11__);\n/* harmony import */ var _components_main_menu_shop_screen_css__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./components/main_menu/shop_screen.css */ \"./src/components/main_menu/shop_screen.css\");\n/* harmony import */ var _components_main_menu_shop_screen_css__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_shop_screen_css__WEBPACK_IMPORTED_MODULE_12__);\n/* harmony import */ var _components_main_menu_shop_item_screen_css__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./components/main_menu/shop_item_screen.css */ \"./src/components/main_menu/shop_item_screen.css\");\n/* harmony import */ var _components_main_menu_shop_item_screen_css__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_shop_item_screen_css__WEBPACK_IMPORTED_MODULE_13__);\n/* harmony import */ var _components_main_menu_coin_shop_screen_css__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./components/main_menu/coin_shop_screen.css */ \"./src/components/main_menu/coin_shop_screen.css\");\n/* harmony import */ var _components_main_menu_coin_shop_screen_css__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_coin_shop_screen_css__WEBPACK_IMPORTED_MODULE_14__);\n/* harmony import */ var _components_main_menu_play_screen_css__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./components/main_menu/play_screen.css */ \"./src/components/main_menu/play_screen.css\");\n/* harmony import */ var _components_main_menu_play_screen_css__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_play_screen_css__WEBPACK_IMPORTED_MODULE_15__);\n/* harmony import */ var _components_main_menu_play_screen_custom_css__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./components/main_menu/play_screen_custom.css */ \"./src/components/main_menu/play_screen_custom.css\");\n/* harmony import */ var _components_main_menu_play_screen_custom_css__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_play_screen_custom_css__WEBPACK_IMPORTED_MODULE_16__);\n/* harmony import */ var _components_main_menu_play_screen_customlist_css__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./components/main_menu/play_screen_customlist.css */ \"./src/components/main_menu/play_screen_customlist.css\");\n/* harmony import */ var _components_main_menu_play_screen_customlist_css__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_play_screen_customlist_css__WEBPACK_IMPORTED_MODULE_17__);\n/* harmony import */ var _components_main_menu_battlepass_screen_css__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./components/main_menu/battlepass_screen.css */ \"./src/components/main_menu/battlepass_screen.css\");\n/* harmony import */ var _components_main_menu_battlepass_screen_css__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_battlepass_screen_css__WEBPACK_IMPORTED_MODULE_18__);\n/* harmony import */ var _components_main_menu_battlepass_list_screen_css__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./components/main_menu/battlepass_list_screen.css */ \"./src/components/main_menu/battlepass_list_screen.css\");\n/* harmony import */ var _components_main_menu_battlepass_list_screen_css__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_battlepass_list_screen_css__WEBPACK_IMPORTED_MODULE_19__);\n/* harmony import */ var _components_main_menu_battlepass_upgrade_screen_css__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./components/main_menu/battlepass_upgrade_screen.css */ \"./src/components/main_menu/battlepass_upgrade_screen.css\");\n/* harmony import */ var _components_main_menu_battlepass_upgrade_screen_css__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_battlepass_upgrade_screen_css__WEBPACK_IMPORTED_MODULE_20__);\n/* harmony import */ var _components_main_menu_notification_screen_css__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./components/main_menu/notification_screen.css */ \"./src/components/main_menu/notification_screen.css\");\n/* harmony import */ var _components_main_menu_notification_screen_css__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_notification_screen_css__WEBPACK_IMPORTED_MODULE_21__);\n/* harmony import */ var _components_main_menu_gift_screen_css__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./components/main_menu/gift_screen.css */ \"./src/components/main_menu/gift_screen.css\");\n/* harmony import */ var _components_main_menu_gift_screen_css__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_gift_screen_css__WEBPACK_IMPORTED_MODULE_22__);\n/* harmony import */ var _components_main_menu_settings_screen_css__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./components/main_menu/settings_screen.css */ \"./src/components/main_menu/settings_screen.css\");\n/* harmony import */ var _components_main_menu_settings_screen_css__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_settings_screen_css__WEBPACK_IMPORTED_MODULE_23__);\n/* harmony import */ var _components_main_menu_customize_screen_css__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./components/main_menu/customize_screen.css */ \"./src/components/main_menu/customize_screen.css\");\n/* harmony import */ var _components_main_menu_customize_screen_css__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_customize_screen_css__WEBPACK_IMPORTED_MODULE_24__);\n/* harmony import */ var _components_main_menu_create_screen_css__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./components/main_menu/create_screen.css */ \"./src/components/main_menu/create_screen.css\");\n/* harmony import */ var _components_main_menu_create_screen_css__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_create_screen_css__WEBPACK_IMPORTED_MODULE_25__);\n/* harmony import */ var _components_main_menu_leaderboards_screen_css__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./components/main_menu/leaderboards_screen.css */ \"./src/components/main_menu/leaderboards_screen.css\");\n/* harmony import */ var _components_main_menu_leaderboards_screen_css__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_leaderboards_screen_css__WEBPACK_IMPORTED_MODULE_26__);\n/* harmony import */ var _components_main_menu_player_profile_screen_css__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./components/main_menu/player_profile_screen.css */ \"./src/components/main_menu/player_profile_screen.css\");\n/* harmony import */ var _components_main_menu_player_profile_screen_css__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_player_profile_screen_css__WEBPACK_IMPORTED_MODULE_27__);\n/* harmony import */ var _components_main_menu_match_screen_css__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./components/main_menu/match_screen.css */ \"./src/components/main_menu/match_screen.css\");\n/* harmony import */ var _components_main_menu_match_screen_css__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_match_screen_css__WEBPACK_IMPORTED_MODULE_28__);\n/* harmony import */ var _components_main_menu_practice_screen_css__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./components/main_menu/practice_screen.css */ \"./src/components/main_menu/practice_screen.css\");\n/* harmony import */ var _components_main_menu_practice_screen_css__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_practice_screen_css__WEBPACK_IMPORTED_MODULE_29__);\n/* harmony import */ var _components_main_menu_license_center_screen_css__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./components/main_menu/license_center_screen.css */ \"./src/components/main_menu/license_center_screen.css\");\n/* harmony import */ var _components_main_menu_license_center_screen_css__WEBPACK_IMPORTED_MODULE_30___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_license_center_screen_css__WEBPACK_IMPORTED_MODULE_30__);\n/* harmony import */ var _components_main_menu_watch_screen_css__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./components/main_menu/watch_screen.css */ \"./src/components/main_menu/watch_screen.css\");\n/* harmony import */ var _components_main_menu_watch_screen_css__WEBPACK_IMPORTED_MODULE_31___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_watch_screen_css__WEBPACK_IMPORTED_MODULE_31__);\n/* harmony import */ var _components_main_menu_learn_screen_css__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./components/main_menu/learn_screen.css */ \"./src/components/main_menu/learn_screen.css\");\n/* harmony import */ var _components_main_menu_learn_screen_css__WEBPACK_IMPORTED_MODULE_32___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_learn_screen_css__WEBPACK_IMPORTED_MODULE_32__);\n/* harmony import */ var _components_main_menu_aim_screen_css__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./components/main_menu/aim_screen.css */ \"./src/components/main_menu/aim_screen.css\");\n/* harmony import */ var _components_main_menu_aim_screen_css__WEBPACK_IMPORTED_MODULE_33___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_aim_screen_css__WEBPACK_IMPORTED_MODULE_33__);\n/* harmony import */ var _components_main_menu_play_screen_combined_css__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./components/main_menu/play_screen_combined.css */ \"./src/components/main_menu/play_screen_combined.css\");\n/* harmony import */ var _components_main_menu_play_screen_combined_css__WEBPACK_IMPORTED_MODULE_34___default = /*#__PURE__*/__webpack_require__.n(_components_main_menu_play_screen_combined_css__WEBPACK_IMPORTED_MODULE_34__);\n/* harmony import */ var _css_ui_postload_css__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./css/ui_postload.css */ \"./src/css/ui_postload.css\");\n/* harmony import */ var _css_ui_postload_css__WEBPACK_IMPORTED_MODULE_35___default = /*#__PURE__*/__webpack_require__.n(_css_ui_postload_css__WEBPACK_IMPORTED_MODULE_35__);\n/* harmony import */ var _esmodules_remote_resources_js__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./esmodules/remote_resources.js */ \"./src/esmodules/remote_resources.js\");\n\n\n\n\n\n //import './css/ui_game_shop.css'; \n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nwindow.RemoteResources = _esmodules_remote_resources_js__WEBPACK_IMPORTED_MODULE_36__;\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ })

/******/ });