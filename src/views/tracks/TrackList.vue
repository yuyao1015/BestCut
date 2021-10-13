<script lang="tsx">
  import type { AudioTrackItem, TrackItem, VideoTrackItem } from '#/track';
  import { defineComponent, PropType } from 'vue';

  export default defineComponent({
    name: '',
    components: {
      //
    },
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
      const getTrackHead = (track: TrackItem) => {
        const head = [track.trackName, track.duration];
        if (props.main) head.unshift('已静音');
        return head;
      };

      const video = (track: VideoTrackItem) => (
        <div class="track-item w-1/3 rounded-sm overflow-hidden my-2">
          <div class="track-item-head w-full h-5">
            {getTrackHead(track).map((title) => (
              <span class="track-item-video-title text-xs mx-1 p-px rounded-sm">{title}</span>
            ))}
          </div>
          <div class="track-item-video h-10">{track.cover}</div>
          <div class="track-item-foot h-5"></div>
        </div>
      );

      const audio = (track: AudioTrackItem) => (
        <div class="track-item w-1/3 rounded-sm overflow-hidden my-2">
          <div class="track-item-audio w-full h-5">
            {
              <span class="track-item-audio-title text-xs mx-1 p-px rounded-sm">
                {track.trackName}
              </span>
            }
          </div>
          <div class="track-item-audio h-8">{track.wave}</div>
        </div>
      );

      // const attachment = (track: TrackItem) => (
      //   <div class="track-item w-4 rounded-sm overflow-hidden my-2">
      //     {track.icon && track.icon()}
      //     {track.trackName}
      //   </div>
      // );

      const trackMap = {
        video,
        audio,
      };

      return () => (
        <div class="track-list">
          {props.tracks.map((track: TrackItem) =>
            trackMap[track.type as keyof typeof trackMap](track)
          )}
        </div>
      );
    },
  });
</script>

<style lang="less" scoped>
  .track-item {
    &-head,
    &-foot {
      background-color: #1e4c51;
    }

    &-video-title {
      background-color: #2f5163;
    }

    &-audio-title {
      background-color: #2e4462;
    }

    &-video,
    &-audio {
      background-color: #182f55;
    }

    &-wave {
      background-color: #3a7faf;
    }

    &-foot-wave {
      background-color: #2d6666;
    }
  }
</style>
