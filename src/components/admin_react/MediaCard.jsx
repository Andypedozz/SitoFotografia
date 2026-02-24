
export default function MediaCard({ media }) {
    return (
        <div>
            <img src={media.percorso} alt={media.percorso} width="200px" height="150px" />
            <p>{media.nome}</p>
        </div>
    )
}