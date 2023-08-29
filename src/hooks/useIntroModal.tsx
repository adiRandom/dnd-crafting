import { useContext, useVisibleTask$ } from "@builder.io/qwik";
import { MODAL_CTX_ID } from "~/components/modal/modal";
import { ModalModel } from "~/models/ModalModel";

function useIntroModal(model: ModalModel) {
    const { openModal$ } = useContext(MODAL_CTX_ID);

      useVisibleTask$(() => {
          setTimeout(() => {
              openModal$(model);
          }, 100);
      });
}

export default useIntroModal;