"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/followup";
exports.ids = ["pages/api/followup"];
exports.modules = {

/***/ "openai":
/*!*************************!*\
  !*** external "openai" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("openai");

/***/ }),

/***/ "(api)/./pages/api/followup.js":
/*!*******************************!*\
  !*** ./pages/api/followup.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var openai__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! openai */ \"openai\");\n/* harmony import */ var openai__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(openai__WEBPACK_IMPORTED_MODULE_0__);\n\nconst configuration = new openai__WEBPACK_IMPORTED_MODULE_0__.Configuration({\n    apiKey: process.env.OPENAI_API_KEY\n});\nconst openai = new openai__WEBPACK_IMPORTED_MODULE_0__.OpenAIApi(configuration);\nasync function handler(req, res) {\n    const { query } = req.body;\n    if (!query) {\n        return res.status(400).json({\n            error: \"Query is required\"\n        });\n    }\n    try {\n        const response = await openai.createChatCompletion({\n            model: \"gpt-3.5-turbo\",\n            messages: [\n                {\n                    role: \"system\",\n                    content: \"You are a helpful assistant providing detailed responses.\"\n                },\n                {\n                    role: \"user\",\n                    content: query\n                }\n            ],\n            max_tokens: 150\n        });\n        const result = response.data.choices[0].message.content.trim();\n        res.status(200).json({\n            result\n        });\n    } catch (error) {\n        console.error(\"Error processing follow-up:\", error);\n        res.status(500).json({\n            error: \"Failed to process follow-up question\"\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvZm9sbG93dXAuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQWtEO0FBRWxELE1BQU1FLGdCQUFnQixJQUFJRixpREFBYUEsQ0FBQztJQUN0Q0csUUFBUUMsUUFBUUMsR0FBRyxDQUFDQyxjQUFjO0FBQ3BDO0FBQ0EsTUFBTUMsU0FBUyxJQUFJTiw2Q0FBU0EsQ0FBQ0M7QUFFZCxlQUFlTSxRQUFRQyxHQUFHLEVBQUVDLEdBQUc7SUFDNUMsTUFBTSxFQUFFQyxLQUFLLEVBQUUsR0FBR0YsSUFBSUcsSUFBSTtJQUUxQixJQUFJLENBQUNELE9BQU87UUFDVixPQUFPRCxJQUFJRyxNQUFNLENBQUMsS0FBS0MsSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBb0I7SUFDM0Q7SUFFQSxJQUFJO1FBQ0YsTUFBTUMsV0FBVyxNQUFNVCxPQUFPVSxvQkFBb0IsQ0FBQztZQUNqREMsT0FBTztZQUNQQyxVQUFVO2dCQUNSO29CQUFFQyxNQUFNO29CQUFVQyxTQUFTO2dCQUE0RDtnQkFDdkY7b0JBQUVELE1BQU07b0JBQVFDLFNBQVNWO2dCQUFNO2FBQ2hDO1lBQ0RXLFlBQVk7UUFDZDtRQUVBLE1BQU1DLFNBQVNQLFNBQVNRLElBQUksQ0FBQ0MsT0FBTyxDQUFDLEVBQUUsQ0FBQ0MsT0FBTyxDQUFDTCxPQUFPLENBQUNNLElBQUk7UUFDNURqQixJQUFJRyxNQUFNLENBQUMsS0FBS0MsSUFBSSxDQUFDO1lBQUVTO1FBQU87SUFDaEMsRUFBRSxPQUFPUixPQUFPO1FBQ2RhLFFBQVFiLEtBQUssQ0FBQywrQkFBK0JBO1FBQzdDTCxJQUFJRyxNQUFNLENBQUMsS0FBS0MsSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBdUM7SUFDdkU7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL3JhdGUtbXktcHJvZmVzc29yLWFpLWFzc2lzdGFudC8uL3BhZ2VzL2FwaS9mb2xsb3d1cC5qcz85ZDFmIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbmZpZ3VyYXRpb24sIE9wZW5BSUFwaSB9IGZyb20gXCJvcGVuYWlcIjtcblxuY29uc3QgY29uZmlndXJhdGlvbiA9IG5ldyBDb25maWd1cmF0aW9uKHtcbiAgYXBpS2V5OiBwcm9jZXNzLmVudi5PUEVOQUlfQVBJX0tFWSxcbn0pO1xuY29uc3Qgb3BlbmFpID0gbmV3IE9wZW5BSUFwaShjb25maWd1cmF0aW9uKTtcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICBjb25zdCB7IHF1ZXJ5IH0gPSByZXEuYm9keTtcblxuICBpZiAoIXF1ZXJ5KSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiUXVlcnkgaXMgcmVxdWlyZWRcIiB9KTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBvcGVuYWkuY3JlYXRlQ2hhdENvbXBsZXRpb24oe1xuICAgICAgbW9kZWw6IFwiZ3B0LTMuNS10dXJib1wiLFxuICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgeyByb2xlOiBcInN5c3RlbVwiLCBjb250ZW50OiBcIllvdSBhcmUgYSBoZWxwZnVsIGFzc2lzdGFudCBwcm92aWRpbmcgZGV0YWlsZWQgcmVzcG9uc2VzLlwiIH0sXG4gICAgICAgIHsgcm9sZTogXCJ1c2VyXCIsIGNvbnRlbnQ6IHF1ZXJ5IH0sXG4gICAgICBdLFxuICAgICAgbWF4X3Rva2VuczogMTUwLFxuICAgIH0pO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gcmVzcG9uc2UuZGF0YS5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudC50cmltKCk7XG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyByZXN1bHQgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIHByb2Nlc3NpbmcgZm9sbG93LXVwOlwiLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gcHJvY2VzcyBmb2xsb3ctdXAgcXVlc3Rpb25cIiB9KTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbIkNvbmZpZ3VyYXRpb24iLCJPcGVuQUlBcGkiLCJjb25maWd1cmF0aW9uIiwiYXBpS2V5IiwicHJvY2VzcyIsImVudiIsIk9QRU5BSV9BUElfS0VZIiwib3BlbmFpIiwiaGFuZGxlciIsInJlcSIsInJlcyIsInF1ZXJ5IiwiYm9keSIsInN0YXR1cyIsImpzb24iLCJlcnJvciIsInJlc3BvbnNlIiwiY3JlYXRlQ2hhdENvbXBsZXRpb24iLCJtb2RlbCIsIm1lc3NhZ2VzIiwicm9sZSIsImNvbnRlbnQiLCJtYXhfdG9rZW5zIiwicmVzdWx0IiwiZGF0YSIsImNob2ljZXMiLCJtZXNzYWdlIiwidHJpbSIsImNvbnNvbGUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api)/./pages/api/followup.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(api)/./pages/api/followup.js"));
module.exports = __webpack_exports__;

})();