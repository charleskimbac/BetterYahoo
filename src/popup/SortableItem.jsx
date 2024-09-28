import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"
import Card from "react-bootstrap/Card";

export default function SortableItem({id}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({id: id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <div ref={setNodeRef} style={ style } {...attributes} {...listeners}>
            <Card style={{margin: "4px", padding: "4px"}}>{id}</Card>
        </div>
    );
}