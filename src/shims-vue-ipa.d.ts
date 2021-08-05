import ClientConstellation from "@/ipa/client";

declare module "vue/types/vue" {
  interface Vue {
    $ipa: ClientConstellation;
  }
}
