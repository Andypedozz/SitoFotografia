
export default function Sidebar({ buttons }) {

    return (
        <div>
            <h1>Sidebar</h1>
            <ul>
                {Object.keys(buttons).map(key => (
                    <li key={key}>
                        <button onClick={buttons[key]}>{key}</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}