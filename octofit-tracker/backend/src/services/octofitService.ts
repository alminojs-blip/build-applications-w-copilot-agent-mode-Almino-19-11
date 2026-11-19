import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

function httpError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

function requireObjectId(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || !mongoose.isValidObjectId(value)) {
    throw httpError(`${fieldName} inválido`, 400);
  }
  return value;
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw httpError('Dados da atividade inválidos', 400);
  }

  const { userId, teamId, type, minutes } = input as {
    userId?: unknown;
    teamId?: unknown;
    type?: unknown;
    minutes?: unknown;
  };
  const validUserId = requireObjectId(userId, 'Pessoa');
  const validTeamId = requireObjectId(teamId, 'Equipe');

  if (typeof type !== 'string' || !type.trim()) {
    throw httpError('Tipo de atividade inválido', 400);
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) {
    throw httpError('Minutos da atividade inválidos', 400);
  }

  const [user, team] = await Promise.all([
    User.findById(validUserId).lean(),
    Team.findById(validTeamId).lean(),
  ]);
  if (!user) throw httpError('Pessoa não encontrada', 404);
  if (!team) throw httpError('Equipe não encontrada', 404);

  return Activity.create({
    user: validUserId,
    team: validTeamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw httpError('Dados da equipe inválidos', 400);
  }

  const { name, mascot, members = [] } = input as {
    name?: unknown;
    mascot?: unknown;
    members?: unknown;
  };
  if (typeof name !== 'string' || !name.trim()) {
    throw httpError('Nome da equipe é obrigatório', 400);
  }
  if (typeof mascot !== 'string' || !mascot.trim()) {
    throw httpError('Mascote da equipe é obrigatório', 400);
  }
  if (!Array.isArray(members)) {
    throw httpError('Integrantes da equipe inválidos', 400);
  }

  const memberIds = members.map((memberId) => requireObjectId(memberId, 'Pessoa integrante'));
  if (memberIds.length > 0) {
    const users = await User.find({ _id: { $in: memberIds } }).select('_id').lean();
    if (users.length !== new Set(memberIds).size) {
      throw httpError('Uma ou mais pessoas integrantes não foram encontradas', 404);
    }
  }

  const team = await Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: memberIds,
  });
  if (memberIds.length > 0) {
    await User.updateMany({ _id: { $in: memberIds } }, { $set: { team: team._id } });
  }
  return team;
}

export async function getLeaderboard() {
  const teams = await Team.find().lean();
  const activities = await Activity.find().lean();
  const totals = new Map<string, number>();

  for (const activity of activities) {
    const teamId = activity.team.toString();
    totals.set(teamId, (totals.get(teamId) ?? 0) + activity.points);
  }

  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: totals.get(team._id.toString()) ?? 0,
      rank: 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName, 'pt-BR'))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const email = decodeURIComponent(userEmail).trim().toLowerCase();
  const user = await User.findOne({ email }).lean();
  if (!user) {
    throw httpError('Pessoa não encontrada', 404);
  }

  const recentActivity = await Activity.findOne({ user: user._id })
    .sort({ occurredAt: -1, _id: -1 })
    .lean();

  let focus = user.fitnessGoal;
  if (recentActivity?.type === 'run' || recentActivity?.type === 'cycle') {
    focus = 'endurance';
  } else if (recentActivity?.type === 'strength') {
    focus = 'strength';
  }

  const suggestions = await Workout.find({ focus }).lean();
  if (suggestions.length === 0) {
    return [];
  }

  const reason = focus === 'strength'
    ? 'Baseado nas atividades recentes de força da pessoa.'
    : focus === 'endurance'
      ? 'Baseado nas atividades recentes de corrida ou resistência da pessoa.'
      : 'Baseado na meta atual de atividade da pessoa.';

  return suggestions.map((workout) => ({ ...workout, reason }));
}

export { User };
