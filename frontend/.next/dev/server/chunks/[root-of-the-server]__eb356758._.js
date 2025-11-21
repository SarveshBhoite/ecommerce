module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/Desktop/WD/ecommerce/frontend/app/api/products/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
async function GET() {
    // Mock data - in production, fetch from database
    const products = [
        {
            id: "1",
            name: "Minimalist Backpack",
            description: "Premium lightweight backpack perfect for daily use",
            price: 89.99,
            image_url: "/classicwatch.jpg?height=400&width=400",
            category: "accessories"
        },
        {
            id: "2",
            name: "Classic Watch",
            description: "Elegant timepiece with leather strap",
            price: 149.99,
            image_url: "/classicwatch.jpg?height=400&width=400",
            category: "accessories"
        },
        {
            id: "3",
            name: "Cotton T-Shirt",
            description: "Comfortable everyday t-shirt in neutral colors",
            price: 29.99,
            image_url: "/classicwatch.jpg?height=400&width=400",
            category: "clothing"
        },
        {
            id: "4",
            name: "Denim Jeans",
            description: "Timeless blue denim with perfect fit",
            price: 79.99,
            image_url: "/classicwatch.jpg?height=400&width=400",
            category: "clothing"
        },
        {
            id: "5",
            name: "Wireless Earbuds",
            description: "High-quality sound with noise cancellation",
            price: 129.99,
            image_url: "/classicwatch.jpg?height=400&width=400",
            category: "electronics"
        },
        {
            id: "6",
            name: "Sunglasses",
            description: "UV protection with stylish frame",
            price: 99.99,
            image_url: "/classicwatch.jpg?height=400&width=400",
            category: "accessories"
        },
        {
            id: "7",
            name: "Sneakers",
            description: "Comfortable walking shoes with cushioning",
            price: 119.99,
            image_url: "/classicwatch.jpg?height=400&width=400",
            category: "clothing"
        },
        {
            id: "8",
            name: "Phone Case",
            description: "Protective case with minimalist design",
            price: 24.99,
            image_url: "/classicwatch.jpg?height=400&width=400",
            category: "electronics"
        }
    ];
    return Response.json(products);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__eb356758._.js.map