export async function fetchTrafficData() {
    const res = await fetch("http://localhost:5001/api/data");
    return res.json();
}
