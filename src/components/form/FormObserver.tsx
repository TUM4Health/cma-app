import { useFormikContext } from "formik";
import { FC, ReactElement, useEffect } from "react";

interface Props {
    onValuesChanged: (values: any) => void;
}

const FormObserver: FC<any> = ({ onValuesChanged }: Props): ReactElement | null => {
    const { values } = useFormikContext();
    useEffect(() => {
        onValuesChanged && onValuesChanged(values);
    }, [onValuesChanged, values]);
    return null;
};

export default FormObserver;