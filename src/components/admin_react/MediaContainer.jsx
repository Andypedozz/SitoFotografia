
export default function MediaContainer({ medias }) {
    return (
        <div>
            {medias.map((media) => <MediaCard media={media} />)}
        </div>
    )
}