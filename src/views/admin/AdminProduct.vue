<template>
  <div v-if="userAdmin">
    <h1>Quản lý sản phẩm</h1>
    <NavigationAdmin />

    <v-container>
      <v-btn color="success" style="float: right" @click="dialog = true">
        Thêm mới
      </v-btn>

      <v-dialog v-model="dialog" width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ titleForm }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="editProduct.name"
                    label="Product name"
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-select
                    v-model="editProduct.categoryId"
                    :items="categories"
                    label="Category name"
                    item-title="name"
                    item-value="id"
                  ></v-select>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="editProduct.price"
                    label="Product price"
                    type="number"
                    :min="0"
                  ></v-text-field>
                </v-col>

                <v-col cols="12"
                  ><v-text-field
                    v-model="editProduct.quantity"
                    label="Product quatity"
                    type="number"
                    :min="0"
                  ></v-text-field
                ></v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="close()"> Close </v-btn>
            <v-btn variant="text" @click="save()"> Save </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogDelete" width="600px">
        <v-card>
          <v-card-title>Chắc chưa?</v-card-title>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="closeDelete()"> Chưa </v-btn>
            <v-btn variant="text" @click="deleteConfirm()"> Chắc </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        v-model:items-length="totalItems"
        :headers="headers"
        :items="products"
        :loading="loading"
        @update:options="getProducts"
      >
        <template v-slot:[`item.id`]="item"> {{ item.index + 1 }}</template>

        <template v-slot:[`item.actions`]="item">
          <v-icon
            size="small"
            color="info"
            class="me-2"
            @click="updateProduct(item.index, item.item.id)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            size="small"
            color="danger"
            @click="deleteProduct(item.index, item.item.id)"
          >
            mdi-delete</v-icon
          >
        </template>
      </v-data-table-server>
    </v-container>

    <SnackBar ref="snackbarRef" />
  </div>

  <div v-else>
    <Forbidden />
  </div>
</template>

<script>
import NavigationAdmin from "@/layouts/NavigationAdmin.vue";
import AdminServices from "@/services/AdminServices";
import SnackBar from "@/components/SnackBar.vue";
import Forbidden from "@/components/403Forbidden";

export default {
  components: {
    NavigationAdmin,
    SnackBar,
    Forbidden,
  },

  watch: {
    dialog(newValue) {
      if (!newValue) {
        this.close();
      }
    },
    dialogDelete(newValue) {
      if (!newValue) {
        this.closeDelete();
      }
    },
  },

  computed: {
    titleForm() {
      return this.editProductIndex === -1
        ? "Thêm mới sản phẩm"
        : "Chỉnh sửa sản phẩm";
    },
  },

  created() {
    let roles = JSON.parse(localStorage.getItem("roles"));

    for (let i = 1; i < roles.length; i++) {
      if (roles[i].name === "ROLE_ADMIN") {
        this.userAdmin = roles[i];
        return;
      }
    }
  },

  data: () => ({
    page: 1,
    itemsPerPage: 5,
    totalItems: 10,
    loading: true,
    userAdmin: "",
    headers: [
      { title: "ID", key: "id", align: "center", sortable: false },
      { title: "Name", key: "name", align: "center", sortable: false },
      {
        title: "Category",
        key: "categoryResponse.name",
        align: "center",
        sortable: false,
      },
      { title: "Price", key: "price", align: "center" },
      { title: "Quantity", key: "quantity", align: "center", sortable: false },
      { title: "Actions", key: "actions", align: "center", sortable: false },
    ],
    products: [],
    categories: [],
    dialog: false,
    dialogDelete: false,
    editProductIndex: -1,
    productId: "",
    editProduct: {
      name: "",
      categoryId: undefined,
      price: "",
      quantity: "",
    },
    productDefault: {
      name: "",
      categoryId: undefined,
      price: "",
      quantity: "",
    },
  }),

  mounted() {
    this.getProducts();
    this.getCategories();
  },

  methods: {
    getProducts() {
      this.loading = true;
      let param = {
        page: this.page,
        size: this.itemsPerPage,
      };
      if (param.size > 0) {
        AdminServices.getProducts(param)
          .then((response) => {
            this.products = response.data.content;
            this.totalItems = response.data.totalElements;
            this.loading = false;
          })
          .catch((e) => {
            console.error(e);
          });
      } else {
        AdminServices.getAllProducts()
          .then((response) => {
            this.products = response.data.content;
            this.totalItems = response.data.totalElements;
            this.loading = false;
          })
          .catch((e) => {
            console.error(e);
          });
      }
    },

    getCategories() {
      AdminServices.getAllCategories()
        .then((response) => {
          this.categories = response.data.content;
        })
        .catch((e) => {
          this.$refs.snackbarRef.showSnackbarError(e);
        });
    },

    updateProduct(index, id) {
      this.dialog = true;
      this.productId = id;
      this.editProductIndex = index;
      this.editProduct = Object.assign({}, this.products.at(index));
    },

    save() {
      if (
        this.editProduct.name.trim().length === 0 ||
        this.editProduct.price < 0 ||
        this.editProduct.quantity < 0
      ) {
        alert("Không được để trống hoặc có số âm");
        return;
      }
      if (this.editProductIndex !== -1) {
        AdminServices.editProduct(this.productId, this.editProduct)
          .then(() => {
            this.getProducts();
          })
          .catch((e) => {
            this.$refs.snackbarRef.showSnackbarError(e);
          });
      } else {
        AdminServices.addProduct(this.editProduct)
          .then(() => {
            this.getProducts();
          })
          .catch((e) => {
            this.$refs.snackbarRef.showSnackbarError(e);
          });
      }
      this.close();
    },

    deleteProduct(index, id) {
      this.dialogDelete = true;
      this.productId = id;
      this.editProductIndex = index;
    },

    deleteConfirm() {
      AdminServices.deleteProduct(this.productId)
        .then(() => {
          this.getProducts();
        })
        .catch((e) => {
          this.$refs.snackbarRef.showSnackbarError(e);
        })
        .finally(() => {
          this.dialogDelete = false;
        });
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editProduct = Object.assign({}, this.productDefault);
        this.editProductIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editProduct = Object.assign({}, this.productDefault);
        this.editProductIndex = -1;
      });
    },
  },
};
</script>
