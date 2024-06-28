import { Button } from "antd";

function TestCode(
    props: {
        name: string;
        num: number
    }

) {
    

    return (
        <>

        <Button>+</Button>
            <p>{props.num} ! </p>
            <p>{props.name} ! </p>
        <Button> -</Button>
        </>
    )
}
export default TestCode;