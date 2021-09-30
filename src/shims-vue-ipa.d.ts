import { ProxyClientConstellation } from "@constl/ipa/lib/proxy/proxy";

declare module "vue/types/vue" {
  interface Vue {
    $ipa: ProxyClientConstellation;
  }
}
