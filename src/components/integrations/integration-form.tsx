"use client";

import { Check, Clock3, GitCommitHorizontal, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SecretInput } from "@/components/secret-input";
import { TutorialHelp } from "@/components/tutorial-help";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TUTORIALS } from "@/lib/constants";
import { validateConfig } from "@/lib/user-config";
import type { PartialUserConfig, UserConfig } from "@/types";

type FieldKey =
  | "azurePat"
  | "azureOrganization"
  | "azureProject"
  | "azureRepositoryId"
  | "azureUserEmail"
  | "optsolvToken"
  | "optsolvUserEmail";
type Provider = "azure" | "optsolv";
type ConnectionState = {
  status: "idle" | "testing" | "success" | "error";
  message?: string;
  testedAt?: string;
};
type Field = {
  key: FieldKey;
  label: string;
  placeholder: string;
  required?: boolean;
  help?: string;
  secret?: boolean;
};

const FIELDS: Record<Provider, Field[]> = {
  azure: [
    {
      key: "azureOrganization",
      label: "Organização",
      placeholder: "nome-da-organizacao",
      required: true,
    },
    { key: "azureProject", label: "Projeto", placeholder: "nome-do-projeto", required: true },
    {
      key: "azureRepositoryId",
      label: "Repositório",
      placeholder: "nome-ou-id-do-repositorio",
      required: true,
    },
    {
      key: "azurePat",
      label: "Personal Access Token (PAT)",
      placeholder: "Seu token de acesso",
      required: true,
      secret: true,
      help: "Use um token com a permissão Code · Read.",
    },
    {
      key: "azureUserEmail",
      label: "Autor dos commits (opcional)",
      placeholder: "Nome ou e-mail do autor",
      help: "Informe o nome ou e-mail usado pelo autor no repositório.",
    },
  ],
  optsolv: [
    {
      key: "optsolvToken",
      label: "Chave de integração ou token M2M",
      placeholder: "Sua credencial de leitura",
      required: true,
      secret: true,
    },
    {
      key: "optsolvUserEmail",
      label: "E-mail do colaborador (opcional)",
      placeholder: "voce@empresa.com",
      help: "Sem filtro, a consulta usa os registros permitidos pela credencial.",
    },
  ],
};

function connectionError(status: number): string {
  if (status === 401)
    return "Credencial recusada. Confira o token e sua validade antes de testar novamente.";
  if (status === 403) return "Acesso negado. Confira as permissões de leitura da credencial.";
  if (status === 404)
    return "Recurso não encontrado. Confira a organização, o projeto e o repositório.";
  if (status === 429) return "Limite de consultas atingido. Aguarde um pouco e teste novamente.";
  return "Não foi possível validar o acesso. Confira a configuração e tente novamente.";
}

export function IntegrationForm({
  provider,
  config,
  onSave,
  clearVersion,
  persistenceAvailable,
}: {
  provider: Provider;
  config: UserConfig;
  onSave: (updates: PartialUserConfig) => void;
  clearVersion: number;
  persistenceAvailable: boolean;
}) {
  const fields = FIELDS[provider];
  const [draft, setDraft] = useState(
    () =>
      Object.fromEntries(fields.map(({ key }) => [key, config[key]])) as Record<FieldKey, string>
  );
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [connection, setConnection] = useState<ConnectionState>({ status: "idle" });
  const [notice, setNotice] = useState("");
  const request = useRef<{ controller?: AbortController; version: number }>({ version: 0 });
  const secretKey = provider === "azure" ? "azurePat" : "optsolvToken";
  const lastClearVersion = useRef(clearVersion);
  const dirty = fields.some(({ key }) => draft[key] !== config[key]);
  const configured = fields
    .filter((field) => field.required)
    .every(({ key }) => Boolean(config[key].trim()));
  const title = provider === "azure" ? "Azure DevOps" : "OptSolv Time Tracker";

  useEffect(
    () => () => {
      request.current.controller?.abort();
      request.current.version += 1;
    },
    []
  );
  useEffect(() => {
    if (lastClearVersion.current === clearVersion) return;
    lastClearVersion.current = clearVersion;
    request.current.controller?.abort();
    request.current.version += 1;
    setDraft((current) => ({ ...current, [secretKey]: "" }));
    setConnection({ status: "idle" });
    setNotice("");
    setErrors({});
  }, [clearVersion, secretKey]);

  function edit(key: FieldKey, value: string) {
    request.current.controller?.abort();
    request.current.version += 1;
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setConnection({ status: "idle" });
    setNotice("");
  }

  function validate() {
    const next: Partial<Record<FieldKey, string>> = {};
    const validation = validateConfig({ ...config, ...draft });
    for (const { key, required, label } of fields) {
      if (required && !draft[key].trim()) next[key] = `${label} é obrigatório.`;
      else if (validation.errors[key]) next[key] = validation.errors[key];
    }
    setErrors(next);
    if (Object.keys(next).length) {
      setNotice("Revise os campos destacados para continuar.");
      document.getElementById(`integration-${Object.keys(next)[0]}`)?.focus();
      return false;
    }
    return true;
  }

  function save() {
    if (!validate()) return;
    onSave(Object.fromEntries(fields.map(({ key }) => [key, draft[key].trim()])));
    setDraft(
      (current) =>
        Object.fromEntries(fields.map(({ key }) => [key, current[key].trim()])) as Record<
          FieldKey,
          string
        >
    );
    setNotice("Configuração aplicada. O teste de conexão verifica o acesso com esses dados.");
  }

  async function testConnection() {
    if (!validate()) return;
    request.current.controller?.abort();
    const controller = new AbortController();
    const version = ++request.current.version;
    request.current.controller = controller;
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    setConnection({ status: "testing" });
    setNotice("");
    const headers: Record<string, string> =
      provider === "azure"
        ? {
            "x-azure-pat": draft.azurePat.trim(),
            "x-azure-organization": draft.azureOrganization.trim(),
            "x-azure-project": draft.azureProject.trim(),
            "x-azure-repository": draft.azureRepositoryId.trim(),
            "x-azure-user-email": draft.azureUserEmail.trim(),
          }
        : {
            "x-optsolv-token": draft.optsolvToken.trim(),
            "x-optsolv-user-email": draft.optsolvUserEmail.trim(),
          };
    try {
      const response = await fetch(`/api/${provider}?operation=test`, {
        headers,
        signal: controller.signal,
        cache: "no-store",
      });
      const data: { success?: boolean } = await response.json();
      if (version !== request.current.version) return;
      setConnection(
        response.ok && data.success
          ? {
              status: "success",
              message:
                "Acesso validado. O resultado confirma esta consulta; a disponibilidade pode mudar.",
              testedAt: new Date().toISOString(),
            }
          : {
              status: "error",
              message: connectionError(response.status),
              testedAt: new Date().toISOString(),
            }
      );
    } catch {
      if (version !== request.current.version) return;
      setConnection({
        status: "error",
        message: controller.signal.aborted
          ? "O teste excedeu 20 segundos. Tente novamente quando a conexão estiver disponível."
          : "Não foi possível concluir o teste. Confira sua conexão e tente novamente.",
        testedAt: new Date().toISOString(),
      });
    } finally {
      window.clearTimeout(timeout);
      if (version === request.current.version) request.current.controller = undefined;
    }
  }

  const stateLabel =
    connection.status === "testing"
      ? "Verificando acesso"
      : connection.status === "success"
        ? "Acesso validado"
        : connection.status === "error"
          ? "Falha no teste"
          : dirty
            ? "Alterações não salvas"
            : configured
              ? persistenceAvailable
                ? "Configuração salva"
                : "Configuração nesta sessão"
              : "Não configurado";

  return (
    <form
      className="connection-block"
      noValidate
      aria-busy={connection.status === "testing"}
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div className="connection-heading">
        {provider === "azure" ? (
          <GitCommitHorizontal aria-hidden="true" />
        ) : (
          <Clock3 aria-hidden="true" />
        )}
        <div>
          <h2>{title}</h2>
          <p>
            {provider === "azure"
              ? "Commits do repositório que você acompanha."
              : "Contexto dos seus registros de tempo."}
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="status-label cursor-help" data-state={connection.status}>
              {stateLabel}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6}>
            {connection.status === "testing"
              ? "Realizando consulta de teste à API..."
              : connection.status === "success"
                ? "Conexão validada com sucesso"
                : connection.status === "error"
                  ? connection.message || "Falha ao validar credenciais"
                  : dirty
                    ? "Alterações preenchidas ainda não salvas"
                    : configured
                      ? persistenceAvailable
                        ? "Configuração persistida neste dispositivo"
                        : "Configuração retida somente nesta sessão"
                      : "Preencha os campos obrigatórios para configurar"}
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="connection-fields">
        {fields.map((field) => {
          const id = `integration-${field.key}`;
          return field.secret ? (
            <SecretInput
              key={field.key}
              id={id}
              label={field.label}
              value={draft[field.key]}
              onChange={(value) => edit(field.key, value)}
              placeholder={field.placeholder}
              error={errors[field.key]}
              help={field.help}
              required={field.required}
            />
          ) : (
            <div key={field.key} className="form-group">
              <Label htmlFor={id}>{field.label}</Label>
              <Input
                id={id}
                value={draft[field.key]}
                type={field.key === "optsolvUserEmail" ? "email" : "text"}
                onChange={(event) => edit(field.key, event.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                autoComplete="off"
                aria-invalid={Boolean(errors[field.key])}
                aria-describedby={
                  [field.help ? `${id}-help` : "", errors[field.key] ? `${id}-error` : ""]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
              />
              {field.help ? (
                <p id={`${id}-help`} className="field-help">
                  {field.help}
                </p>
              ) : null}
              {errors[field.key] ? (
                <p id={`${id}-error`} className="field-error">
                  {errors[field.key]}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      <TutorialHelp tutorial={provider === "azure" ? TUTORIALS.azurePat : TUTORIALS.optsolvToken} />
      <div className="connection-footer">
        <span>
          {dirty
            ? "Teste os dados preenchidos; salve para usá-los na daily."
            : "Preencher dados não comprova acesso."}
        </span>
        <div className="connection-actions">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  variant="outline"
                  disabled={connection.status === "testing"}
                  onClick={testConnection}
                >
                  {connection.status === "testing" ? (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Check aria-hidden="true" />
                  )}
                  {connection.status === "testing" ? "Verificando…" : "Testar conexão"}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              Testar comunicação com a API usando os dados preenchidos
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button type="submit" disabled={!dirty}>
                  Salvar integração
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              {dirty
                ? "Salvar configurações para utilizar na geração da daily"
                : "Nenhuma alteração pendente para salvar"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="connection-feedback" role="status" aria-live="polite">
        {connection.message ? (
          <p className={connection.status === "error" ? "field-error" : "field-help"}>
            {connection.message}
          </p>
        ) : null}
        {connection.testedAt ? (
          <p className="field-help">
            Último teste:{" "}
            <time dateTime={connection.testedAt}>
              {new Date(connection.testedAt).toLocaleString("pt-BR")}
            </time>
          </p>
        ) : null}
        {notice ? (
          <p className="field-help">
            {notice}
            {persistenceAvailable
              ? ""
              : " Armazenamento indisponível. Configurações mantidas somente nesta sessão."}
          </p>
        ) : null}
      </div>
    </form>
  );
}
