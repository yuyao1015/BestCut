<template>
  <div class="h-full overflow-y-scroll">
    <div class="local-resource flex flex-wrap">
      <div class="load-local-file h-20 w-36 mx-0.5 my-2 rounded-md" @click="loadLocalFile">
        <div class="w-full flex items-center justify-center">
          <PlusCircleFilled class="mr-0.5" />
          <div>导入素材</div>
        </div>
        <div class="desc-color text-xs text-center">视频、音频、图片</div>
      </div>

      <Resource
        v-for="(resource, i) in localResource"
        :key="i"
        class="local-resource-list relative mx-0.5 my-2 text-xs"
        :usable="true"
        :resourceName="resource.resourceName"
        :type="resource.type"
        :cover="resource.cover"
        :referenced="resource.referenced"
        :duration="resource.duration"
        :album="resource.album"
        :author="resource.author"
      >
      </Resource>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { PlusCircleFilled, FileImageOutlined } from '@ant-design/icons-vue';

  import Resource from '@/components/Resource.vue';

  import { localResource } from './routes';

  export default defineComponent({
    name: 'LocalResource',
    components: {
      Resource,
      PlusCircleFilled,
      FileImageOutlined,
    },
    props: {
      prop: {
        type: String,
        default: '',
      },
    },
    emits: [],
    setup() {
      const loadLocalFile = () => {
        const input = document.createElement('input');
        input.accept = '.mp4,.aac,.mp3,.jpg,.png';
        input.onclick = () => {
          console.log('load file');
        };
        input.click();
      };

      return {
        localResource,
        loadLocalFile,
      };
    },
  });
</script>

<style scoped lang="less">
  .load-local-file {
    border: dotted 1px #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .local-resource-list:last-child {
    margin-bottom: 1.5rem;
  }
</style>
