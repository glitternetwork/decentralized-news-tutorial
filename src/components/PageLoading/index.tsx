import "./index.less"

export default function PageLoading({ loading }: { loading: boolean }) {
    return (
        loading ? <div className="loader1">
            <div className="loading">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div> : null
    )
}
