import React, { useEffect, useState } from "react";

import Swal from "sweetalert2";
import axios from "axios";

const CreateShipment = () => {
  const [currentStep, setCurrentStep] = useState(1); // Controla el paso actual del formulario
  const [shipmentNumber, setShipmentNumber] = useState(""); // Número de envío (puede ser auto-generado)
  const [batchId, setBatchId] = useState(""); // ID del lote
  const [clientId, setClientId] = useState(""); // ID del cliente seleccionado
  const [receiverId, setReceiverId] = useState(""); // ID del receptor seleccionado
  const [boxes, setBoxes] = useState([]); // Lista de cajas agregadas al envío
  const [clients, setClients] = useState([]); // Lista de clientes disponibles
  const [selectedClient, setSelectedClient] = useState(null); // Cliente seleccionado
  const [receivers, setReceivers] = useState([]); // Lista de receptores del cliente seleccionado
  const [status, setStatus] = useState(1); // Estado por defecto del envío (activo)

  // Cargar lista de clientes al cargar el componente
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/clients", {
          headers: { Authorization: token },
        });
        setClients(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchClients();
  }, []);

  // Cargar receptores cada vez que cambia el cliente seleccionado
  useEffect(() => {
    if (selectedClient) {
      setReceivers(selectedClient.receivers || []);
    }
  }, [selectedClient]);

  // Añadir una caja al envío
  const addBox = (size, weight) => {
    setBoxes([...boxes, { size, weight }]);
  };

  // Eliminar una caja del envío
  const removeBox = (index) => {
    const newBoxes = [...boxes];
    newBoxes.splice(index, 1);
    setBoxes(newBoxes);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/shipments/create",
        { shipmentNumber, batchId, clientId, receiverId, boxes, status },
        {
          headers: { Authorization: token },
        }
      );
      Swal.fire("Envío creado correctamente", "", "success");
    } catch (err) {
      Swal.fire("Error al crear el envío", "", "error");
    }
  };

  // Avanzar al siguiente paso
  const nextStep = () => setCurrentStep(currentStep + 1);

  // Retroceder al paso anterior
  const previousStep = () => setCurrentStep(currentStep - 1);

  // Manejar la selección del cliente
  const handleClientSelection = (e) => {
    const clientId = e.target.value;
    const client = clients.find((c) => c.id === parseInt(clientId, 10));
    setSelectedClient(client);
    setClientId(clientId);
  };

  // Manejar la selección del receptor
  const handleReceiverSelection = (e) => {
    setReceiverId(e.target.value);
  };

  return (
    <div className="container mt-4">
      <h2>Crear Envío</h2>
      <form onSubmit={handleSubmit}>
        {/* Paso 1: Selección de Cliente y Receptor */}
        {currentStep === 1 && (
          <div>
            <h3>Cliente y Receptor</h3>
            <div className="form-group">
              <label>Buscar Cliente</label>
              <select
                className="form-control"
                value={clientId}
                onChange={handleClientSelection}
              >
                <option value="">Seleccionar Cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </option>
                ))}
              </select>
            </div>
            {selectedClient && (
              <div className="form-group">
                <label>Seleccionar Receptor</label>
                <select
                  className="form-control"
                  value={receiverId}
                  onChange={handleReceiverSelection}
                >
                  <option value="">Seleccionar Receptor</option>
                  {receivers.map((receiver, index) => (
                    <option key={index} value={receiver.id}>
                      {receiver.first_name} {receiver.last_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={nextStep}
              disabled={!clientId || !receiverId}
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Paso 2: Selección de Lote y Cajas */}
        {currentStep === 2 && (
          <div>
            <h3>Lote y Cajas</h3>
            <div className="form-group">
              <label>Seleccionar Lote</label>
              <select
                className="form-control"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                required
              >
                <option value="">Seleccionar Lote</option>
                {/* Aquí deberías cargar los lotes disponibles desde la base de datos */}
                <option value="1">Lote 1</option>
                <option value="2">Lote 2</option>
                <option value="3">Lote 3</option>
              </select>
            </div>
            <h4>Cajas</h4>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => addBox("Small", "5kg")}
            >
              Añadir Caja (Small)
            </button>
            <button
              type="button"
              className="btn btn-secondary ml-2"
              onClick={() => addBox("Medium", "10kg")}
            >
              Añadir Caja (Medium)
            </button>
            <button
              type="button"
              className="btn btn-secondary ml-2"
              onClick={() => addBox("Large", "15kg")}
            >
              Añadir Caja (Large)
            </button>
            <ul className="list-group mt-3">
              {boxes.map((box, index) => (
                <li key={index} className="list-group-item">
                  Tamaño: {box.size} - Peso: {box.weight}
                  <button
                    type="button"
                    className="btn btn-danger ml-2"
                    onClick={() => removeBox(index)}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn-primary mt-3"
              onClick={previousStep}
            >
              Anterior
            </button>
            <button
              type="button"
              className="btn btn-primary mt-3 ml-2"
              onClick={nextStep}
              disabled={!batchId || boxes.length === 0}
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Paso 3: Confirmación */}
        {currentStep === 3 && (
          <div>
            <h3>Confirmación</h3>
            <p>
              <strong>Número de Envío:</strong> {shipmentNumber}
            </p>
            <p>
              <strong>Cliente:</strong> {selectedClient?.first_name}{" "}
              {selectedClient?.last_name}
            </p>
            <p>
              <strong>Receptor:</strong> {receiverId}
            </p>
            <p>
              <strong>Lote:</strong> {batchId}
            </p>
            <h4>Cajas</h4>
            <ul className="list-group">
              {boxes.map((box, index) => (
                <li key={index} className="list-group-item">
                  Tamaño: {box.size} - Peso: {box.weight}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn-primary mt-3"
              onClick={previousStep}
            >
              Anterior
            </button>
            <button type="submit" className="btn btn-success mt-3 ml-2">
              Crear Envío
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateShipment;
