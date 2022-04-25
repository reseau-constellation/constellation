import { proxy } from "@constl/ipa";

declare module "vue/types/vue" {
  interface Vue {
    $ipa: proxy.proxy.ProxyClientConstellation;
  }
}
