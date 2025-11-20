import LoadingGif from '@/Assets/gif/loading_bar1.gif'

const Loading = ({ loading, children }) => {
    return (
        <div className="LoaderDiv">
            {loading && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 9999,
                }}>
                    <img src={LoadingGif} alt="Loading..." style={{ width: "150px", height: "150px" }} />
                </div>
            )}
            {children}
        </div>
    );
}

export default Loading;
