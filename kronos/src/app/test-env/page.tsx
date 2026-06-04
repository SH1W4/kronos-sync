export default function TestPage() {
    return (
        <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', height: '100vh' }}>
            <h1>KAIRØS DIAGNOSTIC</h1>
            <p>Server Time: {new Date().toISOString()}</p>
            <p>Status: Rendering Minimal Page</p>
        </div>
    )
}
