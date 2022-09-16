
const Stat = (props) => {
  const {title, data, data2, color} = props
  return <div className="column">
    <div style={{ fontSize: "1.3rem", color: color ?? 'rgb(161,224,189)' }}>
      {title}
    </div>
    <div style={{ fontSize: "1.6rem", fontWeight: "bolder" }}>
      {data}
    </div>
    {data2 && <div>
      {data2}
    </div>}
  </div>
}

export default Stat