<script lang="tsx">
  import type { AudioTrackItem, TrackItem, VideoTrackItem } from '#/track';
  import type { ComponentPublicInstance } from 'vue';

  import { computed, h, defineComponent, PropType, ref } from 'vue';
  import { MoreOutlined } from '@ant-design/icons-vue';

  import { ClickOutside } from '@/directives';
  import { MouseCtl } from '@/logic/mouse';

  import { trackHeadWidth } from '@/settings/componentSetting';

  export default defineComponent({
    name: 'TrackContainer',
    directives: {
      ClickOutside,
    },
    props: {
      list: {
        type: Array as PropType<TrackItem[][]>,
        default: () => [],
      },
      calcWidth: {
        type: Function,
        default: () => {},
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
        if (isMain.value && track.type === 'video') head.unshift('已静音');
        return head;
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

      /*
        border
      */
      const canDrag = ref(true);
      const trackLeftRef = ref<ComponentPublicInstance | null>(null);
      const trackRightRef = ref<ComponentPublicInstance | null>(null);
      let ml: MouseCtl | null = null;
      let mr: MouseCtl | null = null;
      const onTrackLeft = (e: MouseEvent, track: TrackItem) => {
        canDrag.value = false;
        e.stopPropagation();
        const left = (trackLeftRef.value?.$el || trackLeftRef.value) as HTMLElement;
        ml = new MouseCtl(left);
        const { marginLeft } = track;

        ml.moveCallback = function () {
          let dx = this.x - this.lastX;
          if (dx < 0 && ['video', 'audio'].includes(track.type)) {
            dx = dx < marginLeft - track.marginLeft ? marginLeft - track.marginLeft : dx;
          }
          dx = track.width - dx < 20 ? 0 : dx;
          track.start += dx; // TODO: map
          track.marginLeft += dx;
          track.width -= dx;
        };
      };

      const onTrackRight = (e: MouseEvent, track: TrackItem) => {
        canDrag.value = false;
        e.stopPropagation();
        const right = (trackRightRef.value?.$el || trackRightRef.value) as HTMLElement;
        mr = new MouseCtl(right);
        const { width } = track;
        mr.moveCallback = function () {
          let dx = this.x - this.lastX;
          if (dx > 0 && ['video', 'audio'].includes(track.type)) {
            dx = dx > width - track.width ? width - track.width : dx;
          }
          dx = track.width - dx < 20 ? 0 : dx;

          track.end += dx; //
          track.width += dx;
        };
      };

      const offTrackLeft = (e: MouseEvent) => {
        canDrag.value = true;
        e.stopPropagation();
        if (ml) ml.moveCallback = () => {};
      };
      const offTrackRight = (e: MouseEvent) => {
        canDrag.value = true;
        e.stopPropagation();
        if (mr) mr.moveCallback = () => {};
      };

      const trackBorder = (track: TrackItem) =>
        track.active ? (
          <div class="absolute w-full h-full top-0 left-0">
            <div
              ref={trackLeftRef}
              onPointerover={(e: MouseEvent) => onTrackLeft(e, track)}
              onPointerleave={(e: MouseEvent) => offTrackLeft(e)}
              class="track-scale track-scale-left -left-0"
            >
              <MoreOutlined class="absolute -left-1" />
            </div>
            <div
              ref={trackRightRef}
              onPointerover={(e: MouseEvent) => onTrackRight(e, track)}
              onPointerleave={(e: MouseEvent) => offTrackRight(e)}
              class="track-scale  track-scale-right right-0"
            >
              <MoreOutlined class="absolute -right-1" />
            </div>
          </div>
        ) : (
          ''
        );

      /*
        list
      */
      const isListActive = (tracks: TrackItem[]) => {
        let active = false;
        tracks.forEach((track) => {
          if (track.active) active = true;
        });
        return active;
      };
      const onTrackActive = (e: MouseEvent, track: TrackItem) => {
        e.stopPropagation();
        track.active = true;
      };
      const onClickOutside = (track: TrackItem) => {
        track.active = false;
      };

      const trackList = (tracks: TrackItem[]) => (
        <div
          class={['track-list flex w-full my-2', isListActive(tracks) ? 'track-list-active' : '']}
        >
          {tracks.map((track: TrackItem) => (
            <div
              draggable={canDrag.value}
              class={[
                'track-item rounded-sm overflow-hidden text-xs mr-px relative px-1',
                `track-item-${track.type}`,
                track.active ? 'border-white border' : '',
              ]}
              style={`flex:0 0 ${track.width}px; margin-left: ${track.marginLeft}px`}
              onClick={(e: MouseEvent) => onTrackActive(e, track)}
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
      white-space: nowrap;
      overflow: hidden;
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

<style lang="less">
  .video-container {
    .track-list:first-child {
      margin-top: 2.5rem;
    }
  }
</style>
