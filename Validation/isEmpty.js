const isEmpty = (obj) => {
    return (
        obj === null ||
        obj === undefined ||
        typeof obj === "string" && obj.trim() === "" ||
        Object.prototype.toString.call(obj) === '[object Object]' && Object.keys(obj).length < 1 ||
        Array.isArray(obj) && obj.length < 1
    )
}
module.exports = {
    isEmpty
}