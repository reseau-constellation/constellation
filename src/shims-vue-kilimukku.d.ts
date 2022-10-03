import { Kilimukku } from "@/kilimukku/kilimukku";

declare module "vue/types/vue" {
  interface Vue {
    $kilimukku: Kilimukku;
  }
}
