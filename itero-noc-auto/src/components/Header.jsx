import iTerologo from "../assets/iTerologo.png";
export default function Header() {
  return (
    <header className="bg-gray-800 text-white flex items-center px-6 py-4 shadow-md">
      <img
        id="logo"
        src={iTerologo}
        alt="logo"
        className="h-10 w-auto mr-4"
      />
      <h1 className="text-xl font-bold">NOC Infra Dashboard</h1>
    </header>
  );
}


<template>
  <div class="app-container">
    <!-- Use the new Topbar component -->
    <Topbar />

    <!-- Loading / Content -->
    <div v-if="loading" class="loading">Loading items...</div>
    <div v-else class="cards-section">
      <CardsContainer 
        :items="items" 
        @update-item="updateItem"
      />
    </div>
  </div>
</template>

<script>
import Topbar from './components/Topbar.vue'
import CardsContainer from './components/CardsContainer.vue'

export default {
  name: 'App',
  components: {
    Topbar,
    CardsContainer
  },
  data() {
    return {
      items: [],
      loading: true
    }
  },
  mounted() {
    this.fetchItems()
  },
  methods: {
    fetchItems() {
      fetch('https://biuqqcxve2.execute-api.us-west-1.amazonaws.com/dev/cloud_operations_ci_scan_table')
        .then(response => response.json())
        .then(data => {
          this.items = data
          this.loading = false
        })
        .catch(error => {
          console.error('Error fetching items:', error)
          this.loading = false
        })
    },
    updateItem(updatedItem) {
      fetch('https://biuqqcxve2.execute-api.us-west-1.amazonaws.com/dev/cloud_operations_ci_update_item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ci_name: updatedItem.ci_name,
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Update success:', data)
      })
      .catch(error => {
        console.error('Error updating item:', error)
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  background-color: #fff; 
  color: #000; 
  min-height: 100vh;
  margin: 0;
  font-family: Arial, sans-serif;
  width: 100%;
  box-sizing: border-box;
}

.cards-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly; 
  gap: 20px;
  padding: 20px;
}

.loading {
  font-size: 1.2em;
  color: #555;
  margin: 20px;
}
</style>
