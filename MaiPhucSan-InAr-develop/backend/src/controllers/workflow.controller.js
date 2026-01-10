/**
 * Workflow controller (Camunda).
 *
 * TR9 / N_FR2: Workflow-based prototype for a selected business step.
 *
 * This implementation uses Camunda Platform 7 REST API.
 */
const Joi = require('joi');
const env = require('../config/env');
const { CamundaService } = require('../services/camunda.service');

const completeSchema = Joi.object({
  variables: Joi.object().default({})
});

exports.startBonusApproval = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || new Date().getFullYear());

    const camunda = new CamundaService();

    const started = await camunda.startProcess(env.camundaProcessDefinitionKey, {
      employeeId,
      year,
      requestedBy: req.user.username
    });

    return res.json({ data: started });
  } catch (err) {
    return next(err);
  }
};

exports.listTasks = async (req, res, next) => {
  try {
    const { processInstanceId } = req.params;
    const camunda = new CamundaService();
    const tasks = await camunda.listTasks(processInstanceId);
    return res.json({ data: tasks });
  } catch (err) {
    return next(err);
  }
};

exports.completeTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { error, value } = completeSchema.validate(req.body || {});
    if (error) return res.status(400).json({ error: error.message });

    const camunda = new CamundaService();
    await camunda.completeTask(taskId, value.variables);
    return res.json({ data: true });
  } catch (err) {
    return next(err);
  }
};
