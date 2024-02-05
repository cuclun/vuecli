<template>
  <div v-if="userAdmin">
    <HeaderAdmin />
    <NavigationAdmin />
  </div>

  <div v-else>
    <Forbidden />
  </div>
</template>

<script>
import HeaderAdmin from "@/layouts/HeaderAdmin";
import NavigationAdmin from "@/layouts/NavigationAdmin";
import Forbidden from "@/components/403Forbidden";
export default {
  components: {
    HeaderAdmin,
    NavigationAdmin,
    Forbidden,
  },

  data: () => ({
    userAdmin: "",
  }),

  created() {
    let roles = JSON.parse(localStorage.getItem("roles"));

    if (roles.length > 0) {
      for (let i = 1; i < roles.length; i++) {
        if (roles[i].name === "ROLE_ADMIN") {
          this.userAdmin = roles[i];
          return;
        }
      }
    }
  },
};
</script>
