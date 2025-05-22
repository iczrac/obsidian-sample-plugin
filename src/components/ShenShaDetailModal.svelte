<!-- 神煞详情弹窗组件 -->
<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  
  // 接收传入的神煞数据
  export let shenShaData = {
    name: '',
    type: '',
    description: '',
    detailDescription: '',
    calculation: '',
    influence: []
  };
  
  // 控制弹窗显示
  export let showModal = false;
  
  // 关闭弹窗事件
  export function closeModal() {
    showModal = false;
  }
  
  // 获取神煞类型对应的颜色和图标
  function getTypeStyle(type) {
    switch(type) {
      case '吉神':
        return { color: '#4CAF50', icon: '🍀' };
      case '凶神':
        return { color: '#F44336', icon: '⚠️' };
      case '中性':
        return { color: '#2196F3', icon: '🔹' };
      default:
        return { color: '#757575', icon: '🔍' };
    }
  }
  
  // 计算类型样式
  $: typeStyle = getTypeStyle(shenShaData.type);
  
  // 复制计算方法到剪贴板
  function copyCalculation() {
    if (navigator.clipboard && shenShaData.calculation) {
      navigator.clipboard.writeText(shenShaData.calculation)
        .then(() => {
          alert('计算方法已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
        });
    }
  }
</script>

{#if showModal}
<div class="modal-backdrop" on:click={closeModal} transition:fade={{ duration: 200 }}>
  <div class="modal-content" on:click|stopPropagation>
    <!-- 标题区域 -->
    <div class="modal-header">
      <h2>{shenShaData.name}</h2>
      <div class="type-badge" style="background-color: {typeStyle.color}">
        {typeStyle.icon} {shenShaData.type}
      </div>
    </div>
    
    <!-- 分隔线 -->
    <div class="divider"></div>
    
    <!-- 内容区域 -->
    <div class="modal-body">
      <!-- 简短描述 -->
      <div class="description-box">
        <p>{shenShaData.description}</p>
      </div>
      
      <!-- 详细描述 -->
      <div class="detail-section">
        <div class="detail-box">
          <p>{shenShaData.detailDescription}</p>
        </div>
      </div>
      
      <!-- 影响领域 -->
      {#if shenShaData.influence && shenShaData.influence.length > 0}
      <div class="influence-section">
        <h3>影响领域</h3>
        <div class="influence-tags">
          {#each shenShaData.influence as item}
          <span class="influence-tag">{item}</span>
          {/each}
        </div>
      </div>
      {/if}
      
      <!-- 计算方法 -->
      <div class="calculation-section">
        <div class="calculation-header">
          <h3>计算方法</h3>
          <button class="copy-btn" on:click={copyCalculation}>复制</button>
        </div>
        <div class="calculation-box">
          <p>{@html shenShaData.calculation}</p>
        </div>
      </div>
    </div>
    
    <!-- 底部按钮 -->
    <div class="modal-footer">
      <button class="close-btn" on:click={closeModal}>关闭</button>
    </div>
  </div>
</div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  .modal-header {
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
  
  .type-badge {
    padding: 4px 10px;
    border-radius: 16px;
    color: white;
    font-size: 14px;
    font-weight: 500;
  }
  
  .divider {
    height: 1px;
    background-color: #e0e0e0;
    margin: 0;
  }
  
  .modal-body {
    padding: 16px 20px;
  }
  
  .description-box {
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 16px;
  }
  
  .description-box p {
    margin: 0;
    font-size: 16px;
    line-height: 1.5;
  }
  
  .detail-section {
    margin-bottom: 20px;
  }
  
  .detail-box {
    border-left: 4px solid #673AB7;
    padding: 8px 16px;
    background-color: #f9f5ff;
    border-radius: 0 8px 8px 0;
  }
  
  .detail-box p {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
  }
  
  .influence-section {
    margin-bottom: 20px;
  }
  
  .influence-section h3 {
    font-size: 16px;
    margin: 0 0 10px 0;
    color: #424242;
  }
  
  .influence-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .influence-tag {
    background-color: #e3f2fd;
    color: #1976d2;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 14px;
  }
  
  .calculation-section {
    margin-top: 20px;
  }
  
  .calculation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .calculation-header h3 {
    font-size: 16px;
    margin: 0;
    color: #424242;
  }
  
  .copy-btn {
    background-color: #e0e0e0;
    border: none;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s;
  }
  
  .copy-btn:hover {
    background-color: #bdbdbd;
  }
  
  .calculation-box {
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 12px 16px;
    font-family: monospace;
    overflow-x: auto;
  }
  
  .calculation-box p {
    margin: 0;
    line-height: 1.5;
    white-space: pre-wrap;
  }
  
  .modal-footer {
    padding: 16px 20px;
    display: flex;
    justify-content: center;
  }
  
  .close-btn {
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
    padding: 8px 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s;
  }
  
  .close-btn:hover {
    background-color: #e0e0e0;
  }
  
  /* 响应式调整 */
  @media (max-width: 480px) {
    .modal-content {
      width: 95%;
    }
    
    .modal-header h2 {
      font-size: 20px;
    }
  }
</style>
