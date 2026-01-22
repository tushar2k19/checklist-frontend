<template>
  <div class="settings-page">
    <div class="settings-container">
      <h1>Settings</h1>
      <p class="coming-soon">Settings page coming soon...</p>
      <p>This page will allow you to:</p>
      <ul>
        <li>Edit user details</li>
        <li>Change password</li>
        <li>Manage account preferences</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings'
}
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - 80px);
  background: #f7f7f8;
  padding: 40px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-container h1 {
  font-size: 32px;
  font-weight: 600;
  color: #2d333a;
  margin: 0 0 24px 0;
}

.coming-soon {
  font-size: 18px;
  color: #565869;
  margin-bottom: 24px;
}

.settings-container p {
  font-size: 16px;
  color: #565869;
  margin-bottom: 16px;
}

.settings-container ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.settings-container li {
  padding: 12px 0;
  font-size: 16px;
  color: #565869;
  border-bottom: 1px solid #e5e7eb;
}

.settings-container li:last-child {
  border-bottom: none;
}

.settings-container li::before {
  content: "✓ ";
  color: #10a37f;
  font-weight: bold;
  margin-right: 8px;
}
</style>

