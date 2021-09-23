import { ProxieClientConstellation } from "@/plugins/ipa/ipaParallèle";

declare module "vue/types/vue" {
  interface Vue {
    $ipa: ProxieClientConstellation;
  }
}
