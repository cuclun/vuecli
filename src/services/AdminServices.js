import http from "@/http-common";

function authHeader() {
  let accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    return { Authorization: "Bearer " + accessToken };
  } else {
    return {};
  }
}

class AdminServices {
  signUp(data) {
    return http.post("/user/signup", data);
  }

  signIn(data) {
    return http.post("/user/signin", data);
  }
  getCategories(param) {
    return http.get(`/category?page=${param.page}&size=${param.size}`);
  }
  getAllCategories() {
    return http.get(`/category?size=all`);
  }

  addCategory = async (data) => {
    return http.post("/category/", data, { headers: authHeader() });
  };

  editCategory(id, data) {
    return http.put(`/category/${id}`, data, { headers: authHeader() });
  }

  deleteCategory(id) {
    return http.delete(`/category/${id}`, { headers: authHeader() });
  }

  getProducts(param) {
    return http.get(`/product?page=${param.page}&size=${param.size}`);
  }

  getAllProducts() {
    return http.get(`/product?size=all`);
  }

  addProduct = (data) => {
    return http.post("/product/", data, { headers: authHeader() });
  };

  editProduct(id, data) {
    return http.put(`/product/${id}`, data, { headers: authHeader() });
  }

  deleteProduct(id) {
    return http.delete(`/product/${id}`, { headers: authHeader() });
  }

  getProductsByCategory(id) {
    return http.get(`/category/${id}/products`);
  }

  getBills() {
    return http.get("/bill");
  }

  getProductById(id) {
    return http.get(`/product/${id}`);
  }

  addBill(data) {
    return http.post("/bill", data, { headers: authHeader() });
  }

  deleteBill(id) {
    return http.delete(`/bill/${id}`, { headers: authHeader() });
  }

  search(keyword) {
    return http.get(`/product/search?keyword=${keyword}`);
  }
}
export default new AdminServices();
