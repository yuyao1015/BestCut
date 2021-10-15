<script lang="tsx">
  import type { AudioTrackItem, TrackItem, VideoTrackItem } from '#/track';
  import { computed, h, defineComponent, PropType } from 'vue';

  export default defineComponent({
    name: '',
    props: {
      main: {
        type: Boolean,
        default: false,
      },
      tracks: {
        type: Object as PropType<TrackItem[]>,
        default: () => {},
      },
    },
    emits: [],
    setup(props) {
      const tracks = computed(() => props.tracks);
      const getTrackHead = (track: TrackItem) => {
        const head = [track.trackName, track.duration];
        if (props.main && track.type === 'video') head.unshift('已静音');
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
            {<span class="track-item-title">{track.trackName}</span>}
            {<span class="track-item-title">{track.duration}</span>}
          </div>
          <div class="h-8">{track.wave}</div>
        </div>
      );

      const attachment = (track: TrackItem) => (
        <div class={'track-item-head'}>
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

      return () => (
        <div class="track-list">
          {tracks.value.map((track: TrackItem) => (
            <div
              class={[
                'track-item w-1/3 rounded-sm overflow-hidden my-2 text-xs',
                `track-item-${track.type}`,
                track.active ? 'border-white border-t border-b border-l-2 border-r-2' : '',
              ]}
            >
              {trackMap[track.type as keyof typeof trackMap](track)}
            </div>
          ))}
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
    margin-bottom: 0;
  }
</style>
