<script lang="tsx">
  import { ResourceType } from '@/enums/resource';
  import {
    AudioTrack,
    VideoTrack,
    StickerTrack,
    FilterTrack,
    EffectTrack,
    TrackItem,
  } from '@/logic/track';

  import { defineComponent, PropType, h, computed } from 'vue';

  export default defineComponent({
    name: 'Track',
    props: {
      track: {
        type: Object as PropType<TrackItem>,
        default: {},
      },
      isMute: {
        type: Boolean,
        default: false,
      },
    },
    emits: [],
    setup(props, { slots }) {
      const track = computed(() => props.track);

      const getTrackHead = (track: TrackItem) => {
        return [track.name, track.duration];
      };

      const video = (track: VideoTrack) => (
        <div class="video-track h-full w-full">
          <div class="track-item-head">
            {(props.isMute ? ['已静音', ...getTrackHead(track)] : getTrackHead(track)).map(
              (title) => (
                <span class="track-item-title">{title}</span>
              )
            )}
          </div>
          <div class="h-10">cover</div>
          <div class="h-5">foot wave</div>
        </div>
      );

      const audio = (track: AudioTrack) => (
        <div class="audio-track h-full w-full">
          <div class="track-item-head">
            {getTrackHead(track).map((title) => (
              <span class="track-item-title">{title}</span>
            ))}
          </div>
          <div class="h-8">{track.wave}</div>
        </div>
      );

      const attachment = (track: TrackItem) => (
        <div class={'attachment-track track-item-head w-full'}>
          {track instanceof FilterTrack ||
            (track instanceof EffectTrack &&
              (() => h(track.icon, { class: 'track-item-title' }))())}
          {track instanceof StickerTrack ? (
            <img class="track-item-title" src={track.sticker} />
          ) : null}
          {track.type !== ResourceType.Sticker ? (
            <div class="track-item-title">{track.name}</div>
          ) : null}
        </div>
      );

      const trackMap = {
        [ResourceType.Video]: video,
        [ResourceType.Picture]: video,
        [ResourceType.Audio]: audio,
        [ResourceType.Sticker]: attachment,
        [ResourceType.Text]: attachment,
        [ResourceType.Effect]: attachment,
        [ResourceType.Filter]: attachment,
      };

      return () => (
        <div
          class={[
            'track-item rounded-sm overflow-hidden text-xs mr-px relative px-1',
            `track-item-${track.value.type}`,
            track.value.active ? 'border-white border' : '',
          ]}
          style={`flex:0 0 ${track.value.width}px;
                    height: ${track.value.height}px;
                    margin-left: ${track.value.marginLeft}px;
                    margin-right: ${track.value.marginRight}px;
                    `}
        >
          {trackMap[track.value.type as keyof typeof trackMap](track.value)}

          {slots.default ? slots.default() : null}
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

    &-effect {
      background-color: #6e4c7f;
    }

    &-sticker {
      background-color: #cc9641;
    }

    &-filter {
      background-color: #464186;
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
</style>
