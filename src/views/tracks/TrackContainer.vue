<script lang="tsx">
  import type { AudioTrackItem, TrackItem, VideoTrackItem } from '#/track';
  import type { ComponentPublicInstance } from 'vue';

  import { computed, h, defineComponent, PropType, ref } from 'vue';
  import { MoreOutlined } from '@ant-design/icons-vue';

  import { ClickOutside } from '@/directives';
  import { MouseCtl } from '@/logic/mouse';

  import { trackHeadWidth } from '@/settings/componentSetting';

  export default defineComponent({
    name: '',
    directives: {
      ClickOutside,
    },
    props: {
      list: {
        type: Array as PropType<TrackItem[][]>,
        default: () => [],
      },
    },
    emits: [],
    setup(props, { slots }) {
      const list = computed(() => props.list);
      const isMain = computed(() => {
        return Boolean(slots.default);
      });

      const getTrackHead = (track: TrackItem) => {
        const head = [track.trackName, track.duration];
        if (isMain && track.type === 'video') head.unshift('已静音');
        return head;
      };

      const isListActive = (tracks: TrackItem[]) => {
        let active = false;
        tracks.forEach((track) => {
          if (track.active) active = true;
        });
        return active;
      };
      const onTrackActive = (track: TrackItem) => {
        track.active = true;
      };
      const onClickOutside = (track: TrackItem) => {
        track.active = false;
      };

      const trackLeftRef = ref<ComponentPublicInstance | null>(null);
      const trackRightRef = ref<ComponentPublicInstance | null>(null);

      const onTrackLeft = (track: TrackItem) => {
        const left = (trackLeftRef.value?.$el || trackLeftRef.value) as HTMLElement;
        const ml = new MouseCtl(left);

        ml.moveCallback = function () {
          // const dx = this.x - this.lastX;
          if (track.marginLeft) track.marginLeft;
        };
      };

      const onTrackRight = (track: TrackItem) => {
        const right = (trackRightRef.value?.$el || trackLeftRef.value) as HTMLElement;
        const mr = new MouseCtl(right);

        mr.moveCallback = function () {
          // const dx = this.x - this.lastX;
          track;
        };
      };

      const video = (track: VideoTrackItem) => (
        <div class="h-full w-full">
          <div class="track-item-head">
            {getTrackHead(track).map((title) => (
              <span class="track-item-title">{title}</span>
            ))}
          </div>
          <div class="h-10">cover</div>
          <div class="h-5">foot wave</div>
        </div>
      );

      const audio = (track: AudioTrackItem) => (
        <div class="h-full w-full">
          <div class="track-item-head">
            {getTrackHead(track).map((title) => (
              <span class="track-item-title">{title}</span>
            ))}
          </div>
          <div class="h-8">{track.wave}</div>
        </div>
      );

      const attachment = (track: TrackItem) => (
        <div class={'track-item-head w-full'}>
          {track.icon && (() => h(track.icon, { class: 'track-item-title' }))()}
          {track.sticker && (() => <img class="track-item-title" src={track.sticker} />)()}
          {track.type !== 'sticker' &&
            (() => h('div', { class: 'track-item-title' }, track.trackName))()}
        </div>
      );

      const trackMap = {
        video,
        audio,
        sticker: attachment,
        text: attachment,
        sprite: attachment,
      };

      const trackBorder = (track: TrackItem) =>
        track.active ? (
          <div class="absolute w-full h-full top-0 left-0">
            <div
              ref={trackLeftRef}
              onClick={() => onTrackLeft(track)}
              class="track-scale track-scale-left -left-0"
            >
              <MoreOutlined class="absolute -left-1" />
            </div>
            <div
              ref={trackRightRef}
              onClick={() => onTrackRight(track)}
              class="track-scale  track-scale-right right-0"
            >
              <MoreOutlined class="absolute -right-1" />
            </div>
          </div>
        ) : (
          ''
        );

      const trackList = (tracks: TrackItem[]) => (
        <div
          class={['track-list flex w-full my-2', isListActive(tracks) ? 'track-list-active' : '']}
        >
          {tracks.map((track: TrackItem) => (
            <div
              draggable
              class={[
                'track-item rounded-sm overflow-hidden text-xs mr-px relative px-1',
                `track-item-${track.type}`,
                track.active ? 'border-white border' : '',
              ]}
              style={`flex:0 0 ${track.width}px; margin-left: ${track.marginLeft}px`}
              onClick={() => onTrackActive(track)}
              v-clickOutside={() => onClickOutside(track)}
            >
              {trackMap[track.type as keyof typeof trackMap](track)}

              {trackBorder(track)}
            </div>
          ))}
        </div>
      );

      return () => (
        <div class="flex w-full">
          <div class="track-container-head h-full" style={`flex:0 0 ${trackHeadWidth}px;`}>
            {slots.default ? slots.default() : ''}
          </div>
          <div class="list w-full h-full flex flex-col justify-center">
            {list.value.map((tracks) => trackList(tracks))}
          </div>
        </div>
      );
    },
  });
</script>

<style lang="less" scoped>
  .track-item {
    &-video {
      background-color: #1e4c51;
    }

    &-audio {
      background-color: #182f55;
    }

    &-wave {
      background-color: #3a7faf;
    }

    &-foot-wave {
      background-color: #2d6666;
    }

    &-text {
      background-color: #924e3c;
    }

    &-sprite {
      background-color: #6e4c7f;
    }

    &-sticker {
      background-color: #cc9641;
    }

    &-title {
      display: flex;
      align-items: center;
      height: 1rem;
      padding: 0 1px;
      margin: 0 0.25rem;
      border-radius: 0.125rem;
      background-color: rgba(255, 255, 255, 0.1);
    }

    &-head {
      display: flex;
      align-items: center;
      width: 100%;
      height: 1.25rem;
    }
  }

  .track-item:last-child {
    margin-right: 0;
  }

  .track-list-active {
    background-color: #383839;
    border-top: solid 1px #4d4d4e;
    border-bottom: solid 1px #4d4d4e;
  }

  .track-scale {
    position: absolute;
    display: flex;
    align-items: center;
    background-color: #fff;
    height: 100%;
    width: 0.1rem;
    background-size: 100% 100%;
    color: #000;
    font-size: 10px;

    &-left {
      cursor: ew-resize;
    }

    &-right {
      cursor: ew-resize;
    }
  }
</style>
