<!-- 八字神煞详情组件 -->
<script>
  import { onMount } from 'svelte';
  import ShenShaService from '../services/ShenShaService';
  import ShenShaDetailModal from './ShenShaDetailModal.svelte';

  // 接收传入的神煞列表
  export let shenShaList = [];

  // 控制弹窗显示
  let showModal = false;

  // 当前选中的神煞数据
  let selectedShenSha = {
    name: '',
    type: '',
    description: '',
    detailDescription: '',
    calculation: '',
    influence: []
  };

  // 处理神煞点击事件
  function handleShenShaClick(shenSha) {
    // 获取神煞详情
    const shenShaInfo = ShenShaService.getShenShaExplanation(shenSha);

    // 更新选中的神煞数据
    selectedShenSha = {
      name: shenShaInfo.name,
      type: shenShaInfo.type,
      description: shenShaInfo.description,
      detailDescription: shenShaInfo.detailDescription,
      calculation: shenShaInfo.calculation || '',
      influence: shenShaInfo.influence || []
    };

    // 显示弹窗
    showModal = true;
  }

  // 关闭弹窗
  function closeModal() {
    showModal = false;
  }

  // 获取神煞类型对应的样式
  function getShenShaTypeStyle(type) {
    switch(type) {
      case '吉神':
        return 'good-shenshas';
      case '凶神':
        return 'bad-shenshas';
      case '吉凶神':
        return 'mixed-shenshas';
      default:
        return '';
    }
  }
</script>

<div class="shenshas-container">
  {#if shenShaList && shenShaList.length > 0}
    <div class="shenshas-list">
      {#each shenShaList as shenSha}
        {#if shenSha}
          {@const shenShaInfo = ShenShaService.getShenShaInfo(shenSha)}
          {#if shenShaInfo}
            <span
              class="shensha-item {getShenShaTypeStyle(shenShaInfo.type)}"
              on:click={() => handleShenShaClick(shenSha)}
              title={shenShaInfo.description}
            >
              {shenSha.includes(':') ? shenSha.split(':')[1] : shenSha}
            </span>
          {:else}
            <span class="shensha-item" on:click={() => handleShenShaClick(shenSha)}>
              {shenSha.includes(':') ? shenSha.split(':')[1] : shenSha}
            </span>
          {/if}
        {/if}
      {/each}
    </div>
  {:else}
    <div class="no-shenshas">无神煞</div>
  {/if}
</div>

<!-- 神煞详情弹窗 -->
<ShenShaDetailModal
  bind:showModal={showModal}
  shenShaData={selectedShenSha}
/>

<style>
  .shenshas-container {
    margin-top: 8px;
  }

  .shenshas-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .shensha-item {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    cursor: pointer;
    background-color: #f0f0f0;
    transition: background-color 0.2s;
  }

  .shensha-item:hover {
    background-color: #e0e0e0;
  }

  .good-shenshas {
    background-color: #e8f5e9;
    color: #2e7d32;
  }

  .good-shenshas:hover {
    background-color: #c8e6c9;
  }

  .bad-shenshas {
    background-color: #ffebee;
    color: #c62828;
  }

  .bad-shenshas:hover {
    background-color: #ffcdd2;
  }

  .mixed-shenshas {
    background-color: #fff8e1;
    color: #ff8f00;
  }

  .mixed-shenshas:hover {
    background-color: #ffecb3;
  }

  .no-shenshas {
    color: #9e9e9e;
    font-size: 12px;
    font-style: italic;
  }
</style>
