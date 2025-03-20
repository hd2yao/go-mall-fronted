import { defineStore } from 'pinia';

export const useCommodityStore = defineStore('commodity', {
  state: () => ({
    selectedCategoryId: 0,
    currentPage: 1
  }),

  actions: {
    setSelectedCategory(categoryId: number) {
      this.selectedCategoryId = categoryId;
    },

    setCurrentPage(page: number) {
      this.currentPage = page;
    },

    resetState() {
      this.selectedCategoryId = 0;
      this.currentPage = 1;
    }
  }
});
