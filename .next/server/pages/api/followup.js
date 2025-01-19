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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var openai__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! openai */ \"openai\");\n/* harmony import */ var openai__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(openai__WEBPACK_IMPORTED_MODULE_0__);\n\nconst configuration = new openai__WEBPACK_IMPORTED_MODULE_0__.Configuration({\n    apiKey: process.env.OPENAI_API_KEY\n});\nconst openai = new openai__WEBPACK_IMPORTED_MODULE_0__.OpenAIApi(configuration);\nasync function handler(req, res) {\n    const { query, professorData } = req.body;\n    if (!query || !professorData) {\n        return res.status(400).json({\n            error: \"Both query and professorData are required.\"\n        });\n    }\n    try {\n        const { name, rating, reviews } = professorData;\n        // Check if reviews are available\n        if (!reviews || reviews.length === 0) {\n            return res.status(404).json({\n                error: `No reviews found for Professor ${name}. Unable to provide detailed insights.`\n            });\n        }\n        // Enhanced prompt for better follow-up responses\n        const prompt = `\n      The user is asking a follow-up question about Professor ${name}.\n      Here is the information available about the professor:\n      - Rating: ${rating}\n      - Reviews: ${reviews.join(\"; \")}\n\n      Please analyze the reviews and metadata to answer the user's follow-up question in detail:\n      \"${query}\".\n    `;\n        const response = await openai.createChatCompletion({\n            model: \"gpt-3.5-turbo\",\n            messages: [\n                {\n                    role: \"system\",\n                    content: \"You are a helpful assistant providing detailed responses.\"\n                },\n                {\n                    role: \"user\",\n                    content: prompt\n                }\n            ],\n            max_tokens: 200\n        });\n        const result = response.data.choices[0].message.content.trim();\n        res.status(200).json({\n            result\n        });\n    } catch (error) {\n        console.error(\"Error processing follow-up:\", error);\n        res.status(500).json({\n            error: \"Failed to process follow-up question.\"\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvZm9sbG93dXAuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQWtEO0FBRWxELE1BQU1FLGdCQUFnQixJQUFJRixpREFBYUEsQ0FBQztJQUN0Q0csUUFBUUMsUUFBUUMsR0FBRyxDQUFDQyxjQUFjO0FBQ3BDO0FBQ0EsTUFBTUMsU0FBUyxJQUFJTiw2Q0FBU0EsQ0FBQ0M7QUFFZCxlQUFlTSxRQUFRQyxHQUFHLEVBQUVDLEdBQUc7SUFDNUMsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLGFBQWEsRUFBRSxHQUFHSCxJQUFJSSxJQUFJO0lBRXpDLElBQUksQ0FBQ0YsU0FBUyxDQUFDQyxlQUFlO1FBQzVCLE9BQU9GLElBQUlJLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUE2QztJQUNwRjtJQUVBLElBQUk7UUFDRixNQUFNLEVBQUVDLElBQUksRUFBRUMsTUFBTSxFQUFFQyxPQUFPLEVBQUUsR0FBR1A7UUFFbEMsaUNBQWlDO1FBQ2pDLElBQUksQ0FBQ08sV0FBV0EsUUFBUUMsTUFBTSxLQUFLLEdBQUc7WUFDcEMsT0FBT1YsSUFBSUksTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztnQkFDMUJDLE9BQU8sQ0FBQywrQkFBK0IsRUFBRUMsS0FBSyxzQ0FBc0MsQ0FBQztZQUN2RjtRQUNGO1FBRUEsaURBQWlEO1FBQ2pELE1BQU1JLFNBQVMsQ0FBQzs4REFDMEMsRUFBRUosS0FBSzs7Z0JBRXJELEVBQUVDLE9BQU87aUJBQ1IsRUFBRUMsUUFBUUcsSUFBSSxDQUFDLE1BQU07OztPQUcvQixFQUFFWCxNQUFNO0lBQ1gsQ0FBQztRQUVELE1BQU1ZLFdBQVcsTUFBTWhCLE9BQU9pQixvQkFBb0IsQ0FBQztZQUNqREMsT0FBTztZQUNQQyxVQUFVO2dCQUNSO29CQUFFQyxNQUFNO29CQUFVQyxTQUFTO2dCQUE0RDtnQkFDdkY7b0JBQUVELE1BQU07b0JBQVFDLFNBQVNQO2dCQUFPO2FBQ2pDO1lBQ0RRLFlBQVk7UUFDZDtRQUVBLE1BQU1DLFNBQVNQLFNBQVNRLElBQUksQ0FBQ0MsT0FBTyxDQUFDLEVBQUUsQ0FBQ0MsT0FBTyxDQUFDTCxPQUFPLENBQUNNLElBQUk7UUFDNUR4QixJQUFJSSxNQUFNLENBQUMsS0FBS0MsSUFBSSxDQUFDO1lBQUVlO1FBQU87SUFDaEMsRUFBRSxPQUFPZCxPQUFPO1FBQ2RtQixRQUFRbkIsS0FBSyxDQUFDLCtCQUErQkE7UUFDN0NOLElBQUlJLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUF3QztJQUN4RTtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcmF0ZS1teS1wcm9mZXNzb3ItYWktYXNzaXN0YW50Ly4vcGFnZXMvYXBpL2ZvbGxvd3VwLmpzPzlkMWYiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uZmlndXJhdGlvbiwgT3BlbkFJQXBpIH0gZnJvbSBcIm9wZW5haVwiO1xuXG5jb25zdCBjb25maWd1cmF0aW9uID0gbmV3IENvbmZpZ3VyYXRpb24oe1xuICBhcGlLZXk6IHByb2Nlc3MuZW52Lk9QRU5BSV9BUElfS0VZLFxufSk7XG5jb25zdCBvcGVuYWkgPSBuZXcgT3BlbkFJQXBpKGNvbmZpZ3VyYXRpb24pO1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIGNvbnN0IHsgcXVlcnksIHByb2Zlc3NvckRhdGEgfSA9IHJlcS5ib2R5O1xuXG4gIGlmICghcXVlcnkgfHwgIXByb2Zlc3NvckRhdGEpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJCb3RoIHF1ZXJ5IGFuZCBwcm9mZXNzb3JEYXRhIGFyZSByZXF1aXJlZC5cIiB9KTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgeyBuYW1lLCByYXRpbmcsIHJldmlld3MgfSA9IHByb2Zlc3NvckRhdGE7XG5cbiAgICAvLyBDaGVjayBpZiByZXZpZXdzIGFyZSBhdmFpbGFibGVcbiAgICBpZiAoIXJldmlld3MgfHwgcmV2aWV3cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7XG4gICAgICAgIGVycm9yOiBgTm8gcmV2aWV3cyBmb3VuZCBmb3IgUHJvZmVzc29yICR7bmFtZX0uIFVuYWJsZSB0byBwcm92aWRlIGRldGFpbGVkIGluc2lnaHRzLmAsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBFbmhhbmNlZCBwcm9tcHQgZm9yIGJldHRlciBmb2xsb3ctdXAgcmVzcG9uc2VzXG4gICAgY29uc3QgcHJvbXB0ID0gYFxuICAgICAgVGhlIHVzZXIgaXMgYXNraW5nIGEgZm9sbG93LXVwIHF1ZXN0aW9uIGFib3V0IFByb2Zlc3NvciAke25hbWV9LlxuICAgICAgSGVyZSBpcyB0aGUgaW5mb3JtYXRpb24gYXZhaWxhYmxlIGFib3V0IHRoZSBwcm9mZXNzb3I6XG4gICAgICAtIFJhdGluZzogJHtyYXRpbmd9XG4gICAgICAtIFJldmlld3M6ICR7cmV2aWV3cy5qb2luKFwiOyBcIil9XG5cbiAgICAgIFBsZWFzZSBhbmFseXplIHRoZSByZXZpZXdzIGFuZCBtZXRhZGF0YSB0byBhbnN3ZXIgdGhlIHVzZXIncyBmb2xsb3ctdXAgcXVlc3Rpb24gaW4gZGV0YWlsOlxuICAgICAgXCIke3F1ZXJ5fVwiLlxuICAgIGA7XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG9wZW5haS5jcmVhdGVDaGF0Q29tcGxldGlvbih7XG4gICAgICBtb2RlbDogXCJncHQtMy41LXR1cmJvXCIsXG4gICAgICBtZXNzYWdlczogW1xuICAgICAgICB7IHJvbGU6IFwic3lzdGVtXCIsIGNvbnRlbnQ6IFwiWW91IGFyZSBhIGhlbHBmdWwgYXNzaXN0YW50IHByb3ZpZGluZyBkZXRhaWxlZCByZXNwb25zZXMuXCIgfSxcbiAgICAgICAgeyByb2xlOiBcInVzZXJcIiwgY29udGVudDogcHJvbXB0IH0sXG4gICAgICBdLFxuICAgICAgbWF4X3Rva2VuczogMjAwLFxuICAgIH0pO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gcmVzcG9uc2UuZGF0YS5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudC50cmltKCk7XG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyByZXN1bHQgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIHByb2Nlc3NpbmcgZm9sbG93LXVwOlwiLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gcHJvY2VzcyBmb2xsb3ctdXAgcXVlc3Rpb24uXCIgfSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJDb25maWd1cmF0aW9uIiwiT3BlbkFJQXBpIiwiY29uZmlndXJhdGlvbiIsImFwaUtleSIsInByb2Nlc3MiLCJlbnYiLCJPUEVOQUlfQVBJX0tFWSIsIm9wZW5haSIsImhhbmRsZXIiLCJyZXEiLCJyZXMiLCJxdWVyeSIsInByb2Zlc3NvckRhdGEiLCJib2R5Iiwic3RhdHVzIiwianNvbiIsImVycm9yIiwibmFtZSIsInJhdGluZyIsInJldmlld3MiLCJsZW5ndGgiLCJwcm9tcHQiLCJqb2luIiwicmVzcG9uc2UiLCJjcmVhdGVDaGF0Q29tcGxldGlvbiIsIm1vZGVsIiwibWVzc2FnZXMiLCJyb2xlIiwiY29udGVudCIsIm1heF90b2tlbnMiLCJyZXN1bHQiLCJkYXRhIiwiY2hvaWNlcyIsIm1lc3NhZ2UiLCJ0cmltIiwiY29uc29sZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(api)/./pages/api/followup.js\n");

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