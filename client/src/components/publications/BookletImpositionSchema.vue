<template>
  <div class="_bookletSchema">
    <div class="u-instructions">
      <div>
        {{
          $t("booklet_sheet_format", {
            width: sheet_width,
            height: sheet_height,
            format: sheet_format_name ? ` (${sheet_format_name})` : "",
          })
        }}
      </div>
      <div>
        {{
          $t("booklet_summary", {
            signatures: signatures.length,
            sheets: total_sheets,
          })
        }}
        <template v-if="blank_pages_count > 0">
          ·
          {{ $t("booklet_blank_pages", { count: blank_pages_count }) }}
        </template>
      </div>
    </div>

    <div
      v-for="(signature, s_index) in signatures_to_show"
      :key="signature.offset"
      class="_signature"
    >
      <div class="_signature--title">
        {{ $t("signature_n", { n: s_index + 1 }) }}
        ·
        {{
          $t("pages_from_to", {
            start: signature.offset + 1,
            end: Math.min(signature.offset + signature.length, page_count),
          })
        }}
      </div>

      <div
        v-for="(sheet, sh_index) in signature.sheets.slice(0, max_sheets)"
        :key="sh_index"
        class="_sheet"
      >
        <span class="_sheet--label">
          {{ $t("sheet_n", { n: sh_index + 1 }) }}
        </span>
        <div
          v-for="side in ['front', 'back']"
          :key="side"
          class="_side"
          :title="$t(side === 'front' ? 'recto' : 'verso')"
        >
          <span class="_side--label">
            {{ $t(side === "front" ? "recto" : "verso") }}
          </span>
          <span class="_sideSheet">
            <span
              v-for="(page_index, p_index) in sheet[side]"
              :key="p_index"
              class="_page"
              :class="{ 'is--blank': page_index >= page_count }"
              :style="page_style"
            >
              <template v-if="page_index < page_count">
                {{ page_index + 1 }}
              </template>
            </span>
          </span>
        </div>
      </div>
      <div
        v-if="signature.sheets.length > max_sheets"
        class="u-instructions _more"
      >
        {{
          $t("more_sheets", { count: signature.sheets.length - max_sheets })
        }}
      </div>
    </div>

    <div
      v-if="signatures.length > max_signatures"
      class="u-instructions _more"
    >
      {{
        $t("more_signatures", {
          count: signatures.length - max_signatures,
        })
      }}
    </div>
  </div>
</template>
<script>
import { getBookletSignatures } from "../../../../shared/booklet_imposition.mjs";

const iso_a_formats = {
  A3: [297, 420],
  A4: [210, 297],
  A5: [148, 210],
  A6: [105, 148],
};

export default {
  props: {
    page_count: Number,
    signature_size: Number,
    page_width: Number,
    page_height: Number,
  },
  data() {
    return {
      max_signatures: 3,
      max_sheets: 4,
    };
  },
  computed: {
    signatures() {
      if (!this.page_count) return [];
      return getBookletSignatures({
        page_count: this.page_count,
        signature_size: this.signature_size,
      });
    },
    signatures_to_show() {
      return this.signatures.slice(0, this.max_signatures);
    },
    total_sheets() {
      return this.signatures.reduce((acc, s) => acc + s.sheets.length, 0);
    },
    blank_pages_count() {
      return this.total_sheets * 4 - this.page_count;
    },
    sheet_width() {
      return +(this.page_width * 2).toFixed(1);
    },
    sheet_height() {
      return +this.page_height.toFixed(1);
    },
    sheet_format_name() {
      const [short, long] = [this.sheet_width, this.sheet_height].sort(
        (a, b) => a - b
      );
      const name = Object.keys(iso_a_formats).find((key) => {
        const [w, h] = iso_a_formats[key];
        return Math.abs(w - short) <= 1 && Math.abs(h - long) <= 1;
      });
      if (!name) return false;
      return (
        name +
        " " +
        (this.sheet_width > this.sheet_height
          ? this.$t("landscape")
          : this.$t("portrait")
        ).toLowerCase()
      );
    },
    page_style() {
      const height = 32;
      return {
        height: height + "px",
        width: Math.round((height * this.page_width) / this.page_height) + "px",
      };
    },
  },
};
</script>
<style lang="scss" scoped>
._bookletSchema {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
}

._signature {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 2);
  background: var(--c-gris_clair);
  border-radius: var(--border-radius);
}

._signature--title {
  font-weight: 600;
  font-size: var(--sl-font-size-small);
}

._sheet {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}

._sheet--label {
  min-width: 7ch;
  font-size: var(--sl-font-size-small);
}

._side {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}

._side--label {
  font-size: var(--sl-font-size-small);
  color: var(--c-gris_fonce);
}

._sideSheet {
  display: flex;
  flex-flow: row nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);

  // fold line between the two pages
  ._page + ._page {
    border-left: 1px dashed var(--c-gris_fonce);
  }
}

._page {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: var(--c-noir);
  font-size: var(--sl-font-size-small);
  font-variant-numeric: tabular-nums;

  &.is--blank {
    background: repeating-linear-gradient(
      -45deg,
      white,
      white 3px,
      var(--c-gris) 3px,
      var(--c-gris) 4px
    );
  }
}

._more {
  font-size: var(--sl-font-size-small);
}
</style>
